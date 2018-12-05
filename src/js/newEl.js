import document from 'global/document';
import window from 'global/window';
import * as Dom from './utils/dom.js';
import * as stylesheet from './utils/stylesheet.js';
import {IE_VERSION} from './utils/browser';

class NewEl {

  constructor() {
    // Do nothing;
  }

  createEl(player, tag, el, playerElIngest, divEmbed, attrs) {

    if (divEmbed) {
      el = player.el_ = tag;
      tag = player.tag = document.createElement('video');
      while (el.children.length) {
        tag.appendChild(el.firstChild);
      }

      if (!Dom.hasClass(el, 'video-js')) {
        Dom.addClass(el, 'video-js');
      }

      el.appendChild(tag);

      playerElIngest = player.playerElIngest_ = el;
      // move properties over from our custom `video-js` element
      // to our new `video` element. This will move things like
      // `src` or `controls` that were set via js before the player
      // was initialized.
      Object.keys(el).forEach((k) => {
        tag[k] = el[k];
      });
    }

    // set tabindex to -1 to remove the video element from the focus order
    tag.setAttribute('tabindex', '-1');
    attrs.tabindex = '-1';

    // Workaround for #4583 (JAWS+IE doesn't announce BPB or play button)
    // See https://github.com/FreedomScientific/VFO-standards-support/issues/78
    // Note that we can't detect if JAWS is being used, but Player ARIA attribute
    //  doesn't change behavior of IE11 if JAWS is not being used
    if (IE_VERSION) {
      tag.setAttribute('role', 'application');
      attrs.role = 'application';
    }

    // Remove width/height attrs from tag so CSS can make it 100% width/height
    tag.removeAttribute('width');
    tag.removeAttribute('height');

    if ('width' in attrs) {
      delete attrs.width;
    }
    if ('height' in attrs) {
      delete attrs.height;
    }

    Object.getOwnPropertyNames(attrs).forEach(function(attr) {
      // don't copy over the class attribute to the player element when we're in a div embed
      // the class is already set up properly in the divEmbed case
      // and we want to make sure that the `video-js` class doesn't get lost
      if (!(divEmbed && attr === 'class')) {
        el.setAttribute(attr, attrs[attr]);
      }

      if (divEmbed) {
        tag.setAttribute(attr, attrs[attr]);
      }
    });

    // Update tag id/class for use as HTML5 playback tech
    // Might think we should do Player after embedding in container so .vjs-tech class
    // doesn't flash 100% width/height, but class only applies with .video-js parent
    tag.playerId = tag.id;
    tag.id += '_html5_api';
    tag.className = 'vjs-tech';

    // Make player findable on elements
    tag.player = el.player = player;
    // Default state of video is paused
    player.addClass('vjs-paused');

    // Add a style element in the player that we'll use to set the width/height
    // of the player in a way that's still overrideable by CSS, just like the
    // video element
    if (window.VIDEOJS_NO_DYNAMIC_STYLE !== true) {
      player.styleEl_ = stylesheet.createStyleElement('vjs-styles-dimensions');
      const defaultsStyleEl = Dom.$('.vjs-styles-defaults');
      const head = Dom.$('head');

      head.insertBefore(player.styleEl_, defaultsStyleEl ? defaultsStyleEl.nextSibling : head.firstChild);
    }

    player.fill_ = false;
    player.fluid_ = false;

    // Pass in the width/height/aspectRatio options which will update the style el
    player.width(player.options_.width);
    player.height(player.options_.height);
    player.fill(player.options_.fill);
    player.fluid(player.options_.fluid);
    player.aspectRatio(player.options_.aspectRatio);

    // Hide any links within the video/audio tag,
    // because IE doesn't hide them completely from screen readers.
    const links = tag.getElementsByTagName('a');

    for (let i = 0; i < links.length; i++) {
      const linkEl = links.item(i);

      Dom.addClass(linkEl, 'vjs-hidden');
      linkEl.setAttribute('hidden', 'hidden');
    }

    // insertElFirst seems to cause the networkState to flicker from 3 to 2, so
    // keep track of the original for later so we can know if the source originally failed
    tag.initNetworkState_ = tag.networkState;

    // Wrap video tag in div (el/box) container
    if (tag.parentNode && !playerElIngest) {
      tag.parentNode.insertBefore(el, tag);
    }

    // insert the tag as the first child of the player element
    // then manually add it to the children array so that Player.addChild
    // will work properly for other components
    //
    // Breaks iPhone, fixed in HTML5 setup.
    Dom.prependTo(tag, el);
    player.children_.unshift(tag);

    // Set lang attr on player to ensure CSS :lang() in consistent with player
    // if it's been set to something different to the doc
    player.el_.setAttribute('lang', player.language_);

    player.el_ = el;

    return el;
  }
}

export default NewEl;
