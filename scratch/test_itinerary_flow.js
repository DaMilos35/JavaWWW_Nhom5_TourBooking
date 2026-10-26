const sampleJsonItinerary = '[{"day": 1, "title": "TP.HCM - Da Nang", "content": "Don san bay..."}, {"day": 2, "title": "Ba Na Hills", "content": "Cap treo..."}]';

const formatListForInput = (val) => {
  if (!val) return '';
  if (Array.isArray(val)) return val.join('\n');
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && typeof parsed[0] === 'object') {
            return parsed.map(item => `Ngày ${item.day || ''}: ${item.title || ''}\n${item.content || ''}`).join('\n\n');
          }
          return parsed.join('\n');
        }
      } catch (_) {}
    }
    return val;
  }
  return '';
};

const formatItineraryForSubmit = (text) => {
  if (!text || !text.trim()) return null;
  const trimmed = text.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      JSON.parse(trimmed);
      return trimmed;
    } catch (_) {}
  }
  const rawDays = trimmed.split(/(?=(?:NGÀY|Ngày|Day)\s*\d+[:\s-])/gi).filter(Boolean);
  if (rawDays.length > 0) {
    const days = rawDays.map((block, idx) => {
      const firstLineEnd = block.indexOf('\n');
      const titleLine = firstLineEnd !== -1 ? block.substring(0, firstLineEnd).trim() : block.trim();
      const body = firstLineEnd !== -1 ? block.substring(firstLineEnd).trim() : '';
      const dayMatch = titleLine.match(/(?:NGÀY|Ngày|Day)\s*(\d+)/i);
      const dayNum = dayMatch ? parseInt(dayMatch[1]) : (idx + 1);
      const cleanTitle = titleLine.replace(/^(?:NGÀY|Ngày|Day)\s*\d+[:\s-]*/i, '').trim() || `Khám phá ngày ${dayNum}`;
      return {
        day: dayNum,
        title: cleanTitle,
        content: body || cleanTitle
      };
    });
    return JSON.stringify(days);
  }
  return JSON.stringify([{ day: 1, title: 'Lịch trình chi tiết chuyến đi', content: trimmed }]);
};

const asInput = formatListForInput(sampleJsonItinerary);
console.log('Formatted for Textarea:\n' + asInput);
const asSubmit = formatItineraryForSubmit(asInput);
console.log('\nFormatted for Submit:\n' + asSubmit);
console.log('\nMatches original:', JSON.stringify(JSON.parse(sampleJsonItinerary)) === JSON.stringify(JSON.parse(asSubmit)));
