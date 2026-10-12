export function playMusic(scene, key) {
    if (scene.registry.get('musicKey') === key) {
        return;
    }

    const old = scene.registry.get('music');
    if (old) {
        old.stop();
        old.destroy();
    }

    const music = scene.sound.add('music-' + key, {
        loop: true,
        volume: scene.registry.get('musicVolume')
    });
    music.play();
    scene.registry.set('music', music);
    scene.registry.set('musicKey', key);
}

export function stopMusic(scene, key) {
    const old = scene.registry.get('music');
    if (old) {
        old.stop();
        old.destroy();
    }
    scene.registry.set('music', null);
    scene.registry.set('musicKey', null);
}

export function playSfx(scene, key, volume = 1) {
    scene.sound.play(key, {
        volume: volume * scene.registry.get('sfxVolume')
    });
}