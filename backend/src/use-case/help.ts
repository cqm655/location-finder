import { DateTime } from 'luxon';
import { exec } from 'child_process';

const formatDateTime = 'yyyy-MM-dd HH:mm:ss.SSS';

export const getDateTimeFormated = (dateTime: Date) => {
  return DateTime.fromJSDate(dateTime, { zone: 'UTC' }).toFormat(
    formatDateTime,
  );
};

export const connectToShare = () => {
  return new Promise((resolve, reject) => {
    // Comanda care mapează folderul de rețea cu user și parolă
    const command = `net use \\\\10.2.20.155\\RecordedSoundFiles /user:"112MD\\iurii.balan" "FordFusion2022"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Eroare la mapare: ${error.message}`);
        return reject(error);
      }
      console.log('Conectat cu succes la FileShare');
      resolve(stdout);
    });
  });
};

// Apelezi asta o singură dată la pornirea aplicației (în main.ts sau un OnModuleInit)
