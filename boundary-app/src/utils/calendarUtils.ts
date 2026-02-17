// Simple local event type for the simplified calendar screen
export type SimpleEvent = {
    id: string;
    title: string;
    description?: string;
    startDate: string; // ISO
    endDate: string;   // ISO
    allDay?: boolean;
    location?: string;
    color?: string;
};

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const isSameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();

export const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export const addMonths = (d: Date, m: number) => new Date(d.getFullYear(), d.getMonth() + m, 1);

export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

export const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

export const startOfWeekSunday = (d: Date) => {
    const day = d.getDay(); // 0 Sun ... 6 Sat
    const res = new Date(d);
    res.setDate(d.getDate() - day);
    res.setHours(0, 0, 0, 0);
    return res;
};

export const endOfWeekSunday = (d: Date) => {
    const res = new Date(startOfWeekSunday(d));
    res.setDate(res.getDate() + 6);
    return res;
};

export const getMonthDays = (currentMonthDate: Date) => {
    const firstOfMonth = startOfMonth(currentMonthDate);
    const lastOfMonth = endOfMonth(currentMonthDate);
    const gridStart = startOfWeekSunday(firstOfMonth);
    const gridEnd = endOfWeekSunday(lastOfMonth);
    const days: Date[] = [];
    const cur = new Date(gridStart);

    // Safety break to prevent infinite loops if logic fails
    let count = 0;
    while (cur <= gridEnd && count < 42) { // 6 weeks max
        days.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
        count++;
    }
    return days;
};

export const formatEventTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const formatDayHeader = (date: Date) => {
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const day = date.getDate();
    return `${weekday} ${day}`;
};
