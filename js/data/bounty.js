
export const BOUNTY_POOL = [
    { 
        id: 'bronze',
        min: 3,
        max: 10,
        middleManMin: 0.3,
        middleManMax: 0.5,
        weight: 30
    },
    { 
        id: 'silver',
        min: 4,
        max: 8,
        middleManMin: 0.25,
        middleManMax: 0.4,
        weight: 25
    },
    { 
        id: 'gold',
        min: 1,
        max: 3,
        middleManMin: 0.2,
        middleManMax: 0.3,
        weight: 15
    },
    { 
        id: 'stonehide',
        min: 3,
        max: 6,
        middleManMin: 0.3,
        middleManMax: 0.5,
        weight: 15
    },
    { 
        id: 'force',
        min: 2,
        max: 4,
        middleManMin: 0.2,
        middleManMax: 0.4,
        weight: 15
    },
    { 
        id: 'regeneration',
        min: 1,
        max: 2,
        middleManMin: 0.15,
        middleManMax: 0.3,
        weight: 10,
        minDay: 2
    },
    {
        id: 'protection',
        min: 1,
        max: 2,
        middleManMin: 0.15,
        middleManMax: 0.2,
        weight: 10,
        minDay: 3
    },
    {
        id: 'projection',
        min: 1,
        max: 1,
        middleManMin: 0.1,
        middleManMax: 0.2,
        weight: 5,
        minDay: 3
    },
    {
        id: 'blitz',
        min: 1,
        max: 1,
        middleManMin: 0.1,
        middleManMax: 0.15,
        weight: 5,
        minDay: 3
    },
    {
        id: 'diamond',
        min: 1,
        max: 3,
        middleManMin: 0.2,
        middleManMax: 0.3,
        weight: 10,
        minDay: 3
    },
    {
        id: 'ruby',
        min: 1,
        max: 2,
        middleManMin: 0.1,
        middleManMax: 0.15,
        weight: 5,
        minDay: 3
    }
];

export function bountyCount(day) {
    return 2 + Math.floor(day / 2);
}
export const BONUS_MIN = 0.7;
export const BONUS_MAX = 1.2;