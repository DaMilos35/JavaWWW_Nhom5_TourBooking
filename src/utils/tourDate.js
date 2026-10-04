const parseTourDate = (value) => {
  if (!value) return null;
  const datePart = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;

  const [year, month, day] = datePart.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
};

export const formatTourDate = (value) => {
  const date = parseTourDate(value);
  return date ? date.toLocaleDateString('vi-VN') : null;
};

export const hasTourDatePassed = (endDate, today = new Date()) => {
  const date = parseTourDate(endDate);
  if (!date) return false;

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return date < todayStart;
};
