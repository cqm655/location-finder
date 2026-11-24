import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type LocationKind = 'MLP' | 'AML';
export interface LatLon {
  lat: number;
  lon: number;
}

export interface LocationItem {
  kind: LocationKind;
  phone: string; // doar cifre, ex. 37368505858
  timeUtc: string; // ISO 8601, UTC, rotunjit la secundă
  center: LatLon; // AML: punctul; MLP: centrul poligonului
  eventIds: string[]; // evenimentele Seq din care provine poziția
  source?: 'caseFolderId' | 'phone'; // din ce căutare vine rezultatul
  // doar MLP
  cellId?: string;
  polygon?: LatLon[];
  // doar AML
  accuracyM?: number;
  confidence?: number;
  method?: string;
  imei?: string;
  imsi?: string;
  mcc?: number;
  mnc?: number;
}

type Draft = Omit<LocationItem, 'eventIds' | 'source'>;

interface SeqEvent {
  Id: string;
  Timestamp: string;
  Properties: { Name: string; Value: unknown }[];
}

@Injectable()
export class SeqMlpService {
  constructor(private readonly config: ConfigService) {}

  private get seqUrl(): string {
    return this.config.getOrThrow<string>('SEQ_URL');
  }
  private get seqKey(): string {
    return this.config.getOrThrow<string>('SEQ_API_KEY');
  }

  async getLocations(
    phone: string,
    caseFolderId?: string,
    from?: string,
    to?: string,
  ): Promise<LocationItem[]> {
    // doar cifre, fără zerourile de la început (curățare, nu validare)
    const digits = (phone ?? '').replace(/\D/g, '').replace(/^0+/, '');

    const fromIso = this.safeDate(from, new Date(Date.now() - 24 * 3600_000));
    const toIso = this.safeDate(to, new Date());

    // 1) după dosar
    const folder = (caseFolderId ?? '').trim();
    if (/^\d{1,12}$/.test(folder)) {
      const events = await this.fetchAll(
        `payload like '%${folder}%'`,
        fromIso,
        toIso,
      );
      const found = this.extract(events, 'caseFolderId');
      if (found.length > 0) return found;
    }

    // 2) dacă dosarul nu dă poziții, după telefon
    if (!digits) return [];

    const events = await this.fetchAll(
      `phone_number like '%${digits}%'`,
      fromIso,
      toIso,
    );
    return this.extract(events, 'phone');
  }

  // dată validă -> "2026-11-11T09:38:55Z"; altfel valoarea implicită
  private safeDate(v: string | undefined, fallback: Date): string {
    const d = v ? new Date(v) : fallback;
    return (Number.isNaN(d.getTime()) ? fallback : d)
      .toISOString()
      .replace(/\.\d{3}Z$/, 'Z');
  }

  // ---------- extragere poziții din evenimente ----------

  private extract(
    events: SeqEvent[],
    source: 'caseFolderId' | 'phone',
  ): LocationItem[] {
    // aceeași poziție apare în 2-4 evenimente: le unim după tip + număr + secundă
    const merged = new Map<string, LocationItem>();
    const add = (d: Draft | null, eventId: string) => {
      if (!d) return;
      const key = `${d.kind}|${d.phone}|${d.timeUtc}`;
      const prev = merged.get(key);
      if (!prev) {
        merged.set(key, { ...d, source, eventIds: [eventId] });
        return;
      }
      for (const [k, v] of Object.entries(d)) {
        if (
          v !== undefined &&
          (prev as unknown as Record<string, unknown>)[k] === undefined
        ) {
          (prev as unknown as Record<string, unknown>)[k] = v;
        }
      }
      prev.eventIds.push(eventId);
    };

    for (const ev of events) {
      const p = Object.fromEntries(ev.Properties.map((x) => [x.Name, x.Value]));
      const evPhone = String(p['phone_number'] ?? '').replace(/\D/g, '');
      const payload = this.parseJson(p['payload']);
      const kase = this.parseJson(p['case']);

      // MLP: payload = { cell, mlp: "<svc_result>...", response }
      if (
        payload &&
        typeof payload === 'object' &&
        typeof payload.mlp === 'string'
      ) {
        add(this.fromMlp(payload.mlp, payload.cell?.value?.id), ev.Id);
      }

      // AML din obiectul `case`
      if (kase?.caseType === 'Aml') {
        add(this.fromAmlCase(kase, evPhone, ev.Timestamp), ev.Id);
      }

      // AML din mesajul brut: payload = "A\"ML=1;..." sau { message: "A\"ML=1;..." }
      const msg = typeof payload === 'string' ? payload : payload?.message;
      if (typeof msg === 'string' && /A"?ML=\d/.test(msg)) {
        add(this.fromAmlMessage(msg, evPhone), ev.Id);
      }
    }

    return [...merged.values()].sort((a, b) =>
      a.timeUtc.localeCompare(b.timeUtc),
    );
  }

  // ---------- Seq ----------

  private async fetchAll(
    filter: string,
    from: string,
    to: string,
  ): Promise<SeqEvent[]> {
    // intervalul intră în filtru; parantezele sunt necesare dacă `filter` conține `or`
    const fullFilter =
      `(${filter}) and ` +
      `@Timestamp >= DateTime('${from}') and ` +
      `@Timestamp < DateTime('${to}')`;

    const all: SeqEvent[] = [];
    let afterId: string | undefined;

    for (let page = 0; page < 100; page++) {
      const params = new URLSearchParams({ filter: fullFilter, count: '1000' });
      if (afterId) params.set('afterId', afterId);

      const res = await fetch(`${this.seqUrl}/api/events/?${params}`, {
        headers: { 'X-Seq-ApiKey': this.seqKey },
      });
      if (!res.ok)
        throw new InternalServerErrorException(
          `Seq a răspuns cu ${res.status}`,
        );

      const body = await res.json();
      const isArray = Array.isArray(body);
      const events: SeqEvent[] = isArray ? body : (body.Events ?? []);
      const stats = isArray ? undefined : body.Statistics;

      all.push(...events);

      let next: string | undefined;
      if (stats) {
        if (stats.Status !== 'Partial') break; // căutare completă
        next = stats.LastReadEventId; // continuăm chiar dacă pagina a fost goală
      } else {
        next = events[events.length - 1]?.Id; // tablou simplu: fără status
      }
      if (!next || next === afterId) break;
      afterId = next;
    }
    return all;
  }

  // ---------- parsere ----------

  // returnează obiect, string sau undefined; scoate BOM-ul de la început
  private parseJson(v: unknown): any {
    if (typeof v !== 'string') return undefined;
    try {
      return JSON.parse(v.replace(/^\uFEFF/, ''));
    } catch {
      return undefined;
    }
  }

  private fromMlp(xml: string, cellId?: string): Draft | null {
    const msid = xml.match(/<msid>(\d+)<\/msid>/)?.[1];
    const t = xml.match(/<time utc_off="([+-]\d{4})">(\d{14})<\/time>/);
    const polygon = [...xml.matchAll(/<X>([^<]+)<\/X><Y>([^<]+)<\/Y>/g)].map(
      (m) => ({
        lat: this.dms(m[1]),
        lon: this.dms(m[2]),
      }),
    );
    if (!msid || !t || !polygon.length) return null;

    const pts = polygon.slice(0, -1); // ultimul punct repetă primul
    return {
      kind: 'MLP',
      phone: msid,
      timeUtc: this.toUtcIso(t[2], t[1]),
      center: {
        lat: pts.reduce((s, x) => s + x.lat, 0) / pts.length,
        lon: pts.reduce((s, x) => s + x.lon, 0) / pts.length,
      },
      polygon,
      cellId,
    };
  }

  // locationTime apare în mai multe forme:
  //   13 cifre = epoch ms         (1792647540982)
  //   14 cifre = yyyyMMddHHmmss   (20261026094103), tratat ca UTC, ca `top`
  //   10 cifre = epoch secunde
  private parseLocationTime(v: unknown): string | null {
    const s = String(v ?? '').trim();
    try {
      if (/^\d{14}$/.test(s)) return this.toUtcIso(s);
      if (/^\d{13}$/.test(s))
        return new Date(Math.floor(Number(s) / 1000) * 1000).toISOString();
      if (/^\d{10}$/.test(s)) return new Date(Number(s) * 1000).toISOString();
    } catch {
      // dată invalidă
    }
    return null;
  }

  private fromAmlCase(
    c: any,
    fallbackPhone: string,
    eventTimestamp?: string,
  ): Draft | null {
    // locationTime din caz; dacă lipsește, timestamp-ul evenimentului din Seq
    const timeUtc =
      this.parseLocationTime(c.locationTime) ??
      (eventTimestamp ? new Date(eventTimestamp).toISOString() : null);

    if (
      typeof c.latitude !== 'number' ||
      typeof c.longitude !== 'number' ||
      !timeUtc
    ) {
      return null;
    }

    return {
      kind: 'AML',
      phone: String(c.phoneNumber ?? fallbackPhone).replace(/\D/g, ''),
      timeUtc,
      center: { lat: c.latitude, lon: c.longitude },
      accuracyM: c.accuracy,
      confidence: c.locationConfidence,
      method: c.positioningMethod,
      imei: c.imei,
      imsi: c.imsi,
      mcc: c.networkMcc,
      mnc: c.networkMnc,
    };
  }

  private fromAmlMessage(msg: string, phone: string): Draft | null {
    const f: Record<string, string> = {};
    for (const part of msg.split(';').slice(1)) {
      // primul segment e `A"ML=1`
      const i = part.indexOf('=');
      if (i > 0) f[part.slice(0, i)] = part.slice(i + 1);
    }
    const lat = parseFloat(f.lt);
    const lon = parseFloat(f.lg);
    if (Number.isNaN(lat) || Number.isNaN(lon) || !/^\d{14}$/.test(f.top ?? ''))
      return null;

    const num = (s?: string) => (s === undefined ? undefined : Number(s));
    return {
      kind: 'AML',
      phone,
      timeUtc: this.toUtcIso(f.top), // `top` e deja în UTC
      center: { lat, lon },
      accuracyM: num(f.rd),
      confidence: num(f.lc),
      method: f.pm,
      imsi: f.si,
      imei: f.ei,
      mcc: num(f.mcc),
      mnc: num(f.mnc),
    };
  }

  // "47 1 17.029N" -> 47.021397
  private dms(s: string): number {
    const [d, m, rest] = s.trim().split(/\s+/);
    const v = Number(d) + Number(m) / 60 + parseFloat(rest) / 3600;
    return /[SW]$/.test(rest) ? -v : v;
  }

  // "20261022083905" + "+0300" -> "2026-10-22T05:39:05.000Z"
  private toUtcIso(ts: string, offset = '+0000'): string {
    const n = (a: number, b: number) => Number(ts.slice(a, b));

    const ms = Date.UTC(
      n(0, 4),
      n(4, 6) - 1,
      n(6, 8),
      n(8, 10),
      n(10, 12),
      n(12, 14),
    );

    const sign = offset[0] === '-' ? -1 : 1;

    const off =
      sign *
      (Number(offset.slice(1, 3)) * 60 + Number(offset.slice(3, 5))) *
      60_000;

    return new Date(ms - off).toISOString();
  }
}
