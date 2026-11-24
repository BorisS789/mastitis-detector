export const API_URL = "http://localhost:8000";

export async function predictCsv(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/predict/csv`, {
        method: "POST",
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
            typeof err.detail === "string"
                ? err.detail
                : `Îøèáêà ñåğâåğà (${res.status})`
        );
    }
    return res.json();
}

// ÂĞÅÌÅÍÍÎ: òåñòîâàÿ èñòîğèÿ ïîêàçàòåëåé çà 7 äíåé.
// Êîãäà áıêåíä ñäåëàåò GET /cows/{id}/history, çàìåíèòü òåëî ôóíêöèè íà:
//   const res = await fetch(`${API_URL}/cows/${cowId}/history`);
//   return res.json();
// Ôîğìàò îòâåòà: [{ date, activity, rumination, temperature }, ...]
export async function getCowHistory(cowId) {
    const res = await fetch(
        `${API_URL}/cows/${encodeURIComponent(cowId)}/history`
    );
    if (!res.ok) throw new Error(`Íå óäàëîñü çàãğóçèòü èñòîğèş (${res.status})`);
    const data = await res.json();
    return data.map((d) => ({
        ...d,
        date: new Date(d.date).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
        }),
    }));
}

function round(x, digits) {
    return Number(x.toFixed(digits));
}

// Ãåíåğàòîğ ïñåâäîñëó÷àéíûõ ÷èñåë, ÷òîáû ó îäíîé êîğîâû ãğàôèê íå ìåíÿëñÿ ïğè êàæäîì îòêğûòèè.
function seeded(seed) {
    let s = 0;
    for (const ch of String(seed)) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
    return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
    };
}