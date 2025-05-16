// Настройки режима шуток
let enabled = true;
let jokeEnabled = true;
let laterEnabled = true;
let smileRainEnabled = true;

let smileRainEmojis = '👽😈🤡🤑🐸🐟😺🧡🔥🍕🌸';
let smileRainInterval = 200;

module.exports = {
    isEnabled: () => enabled,
    enable: () => { enabled = true; },
    disable: () => { enabled = false; },

    isJokeEnabled: () => jokeEnabled,
    enableJoke: () => { jokeEnabled = true; },
    disableJoke: () => { jokeEnabled = false; },

    isLaterEnabled: () => laterEnabled,
    enableLater: () => { laterEnabled = true; },
    disableLater: () => { laterEnabled = false; },

    isSmileRainEnabled: () => smileRainEnabled,
    enableSmileRain: () => { smileRainEnabled = true; },
    disableSmileRain: () => { smileRainEnabled = false; },

    getSmileRainEmojis: () => smileRainEmojis,
    setSmileRainEmojis: (str) => { smileRainEmojis = str || '😀😂😎😍🥳🤩😜😇🤓'; },

    getSmileRainInterval: () => smileRainInterval,
    setSmileRainInterval: (val) => { smileRainInterval = val > 0 ? val : 100; }
};