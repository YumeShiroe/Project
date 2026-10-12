const KEY = 'fungiScores';
const MAX = 8;

export function loadScores() {
    try {
        const saved = JSON.parse(localStorage.getItem(KEY));
        if (Array.isArray(saved)) {
            return saved;
        }
    } catch (error) {
        return [];
    }
    return [];
}

export function addScore(name, days, gold) {
    const score = loadScores();
    const entry = {
        name: name,
        days: days,
        gold: gold, 
        time: Date.now()
    };
    score.push(entry);

    score.sort((a, b) => {
        if (a.days !== b.days) {
            return a.days - b.days;
        }
        return b.gold - a.gold;
    });

    const top = score.slice(0, MAX);
    try {
        localStorage.setItem(KEY, JSON.stringify(top));
    } catch (error) {
    }
    return top.indexOf(entry);
}