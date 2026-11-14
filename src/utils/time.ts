function getWibNow(): { day: number; hours: number; minutes: number } {
  // Compute current time in WIB (UTC+07:00) for Cianjur regardless of device timezone
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const wib = new Date(utcMs + 7 * 3_600_000);
  return {
    day: wib.getDay(),
    hours: wib.getHours(),
    minutes: wib.getMinutes(),
  };
}

export function getOpenStatus(
  open_days: number[],
  open_time: string,
  close_time: string,
): { isOpen: boolean; label: string } {
  if (open_time === '00:00' && close_time === '23:59') {
    return { isOpen: true, label: 'BUKA 24 JAM' };
  }

  const { day, hours, minutes } = getWibNow();

  if (!open_days.includes(day)) {
    if (day === 1 && !open_days.includes(1)) {
      return { isOpen: false, label: 'TUTUP HARI SENIN' };
    }
    if (day === 0 && !open_days.includes(0)) {
      return { isOpen: false, label: 'TUTUP HARI MINGGU' };
    }
    const nextDay = open_days.find((d) => d > day) ?? open_days[0];
    const names = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    return { isOpen: false, label: `TUTUP - Buka ${names[nextDay]} ${open_time}` };
  }

  const [oh, om] = open_time.split(':').map(Number);
  const [ch, cm] = close_time.split(':').map(Number);
  const mins = hours * 60 + minutes;
  const openMins = oh * 60 + om;
  const closeMins = ch * 60 + cm;

  if (mins >= openMins && mins < closeMins) {
    return { isOpen: true, label: 'BUKA SEKARANG' };
  }

  if (mins < openMins) {
    return { isOpen: false, label: `TUTUP - Buka ${open_time}` };
  }

  return { isOpen: false, label: 'TUTUP HARI INI' };
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

export function formatPrice(idr: number): string {
  return `Rp${idr.toLocaleString('id-ID')}`;
}
