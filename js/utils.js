// Preload images (for background images, the URL is loaded in an Image and decoded)
const preloadImages = (selector = 'img') => {
    return Promise.all(gsap.utils.toArray(selector).map((el) => {
        let img = el;
        if ( el.tagName !== 'IMG' ) {
            const url = getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];
            if ( !url ) return Promise.resolve();
            img = new Image();
            img.src = url;
        }
        // A broken image shouldn't keep the page from showing
        return img.decode().catch(() => {});
    }));
};

// Reduced motion: instead of the effect, fade each item in as it scrolls into view
const fadeOnScroll = (items) => {
	items.forEach(item => {
		gsap.fromTo(item, {
			opacity: 0
		}, {
			ease: 'none',
			opacity: 1,
			scrollTrigger: {
				trigger: item,
				start: 'top bottom',
				end: 'top center',
				scrub: true
			}
		});
	});
};

export {
    preloadImages,
    fadeOnScroll,
};