import window from 'global/window';
import * as stylesheet from './utils/stylesheet.js';

class UpdateStyle {
  constructor() {
    // Do nothing
  }

  updateStyleEl(player) {
    if (window.VIDEOJS_NO_DYNAMIC_STYLE === true) {
      const width = typeof player.width_ === 'number' ? player.width_ : player.options_.width;
      const height = typeof player.height_ === 'number' ? player.height_ : player.options_.height;
      const techEl = player.tech_ && player.tech_.el();

      if (techEl) {
        if (width >= 0) {
          techEl.width = width;
        }
        if (height >= 0) {
          techEl.height = height;
        }
      }

      return;
    }

    let width;
    let height;
    let aspectRatio;
    let idClass;

    // The aspect ratio is either used directly or to calculate width and height.
    if (player.aspectRatio_ !== undefined && player.aspectRatio_ !== 'auto') {
      // Use any aspectRatio that's been specifically set
      aspectRatio = player.aspectRatio_;
    } else if (player.videoWidth() > 0) {
      // Otherwise try to get the aspect ratio from the video metadata
      aspectRatio = player.videoWidth() + ':' + player.videoHeight();
    } else {
      // Or use a default. The video element's is 2:1, but 16:9 is more common.
      aspectRatio = '16:9';
    }

    // Get the ratio as a decimal we can use to calculate dimensions
    const ratioParts = aspectRatio.split(':');
    const ratioMultiplier = ratioParts[1] / ratioParts[0];

    if (player.width_ !== undefined) {
      // Use any width that's been specifically set
      width = player.width_;
    } else if (player.height_ !== undefined) {
      // Or calulate the width from the aspect ratio if a height has been set
      width = player.height_ / ratioMultiplier;
    } else {
      // Or use the video's metadata, or use the video el's default of 300
      width = player.videoWidth() || 300;
    }

    if (player.height_ !== undefined) {
      // Use any height that's been specifically set
      height = player.height_;
    } else {
      // Otherwise calculate the height from the ratio and the width
      height = width * ratioMultiplier;
    }

    // Ensure the CSS class is valid by starting with an alpha character
    if ((/^[^a-zA-Z]/).test(player.id())) {
      idClass = 'dimensions-' + player.id();
    } else {
      idClass = player.id() + '-dimensions';
    }

    // Ensure the right class is still on the player for the style element
    player.addClass(idClass);

    stylesheet.setTextContent(player.styleEl_, `
      .${idClass} {
        width: ${width}px;
        height: ${height}px;
      }

      .${idClass}.vjs-fluid {
        padding-top: ${ratioMultiplier * 100}%;
      }
    `);
  }
}
export default UpdateStyle;
