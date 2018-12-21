class ManualAutoplay {

  constructor() {
    // Do nothing
  }

  manualAutoplay(player, type) {
    if (!player.tech_ || typeof type !== 'string') {
      return;
    }

    const muted = () => {
      const previouslyMuted = player.muted();

      player.muted(true);

      const playPromise = player.play();

      if (!playPromise || !playPromise.then || !playPromise.catch) {
        return;
      }

      return playPromise.catch((e) => {
        // restore old value of muted on failure
        player.muted(previouslyMuted);
      });
    };

    let promise;

    if (type === 'any') {
      promise = player.play();

      if (promise && promise.then && promise.catch) {
        promise.catch(() => {
          return muted();
        });
      }
    } else if (type === 'muted') {
      promise = muted();
    } else {
      promise = player.play();
    }

    if (!promise || !promise.then || !promise.catch) {
      return;
    }

    return promise.then(() => {
      player.trigger({type: 'autoplay-success', autoplay: type});
    }).catch((e) => {
      player.trigger({type: 'autoplay-failure', autoplay: type});
    });

  }
}

export default ManualAutoplay;
