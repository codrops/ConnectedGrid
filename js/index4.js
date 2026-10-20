import { preloadImages, fadeOnScroll } from './utils.js';

// Define a variable that will store the Lenis smooth scrolling object
let lenis;

// Get all grid items within the grid
const gridItems = document.querySelectorAll('.grid__item');

// Check if the user prefers reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Function to initialize Lenis for smooth scrolling
const initSmoothScrolling = () => {
	// Instantiate the Lenis object with specified properties
	lenis = new Lenis({
		lerp: 0.15, // Lower values create a smoother scroll effect
		smoothWheel: true // Enables smooth scrolling for mouse wheel events
	});

	// Update ScrollTrigger each time the user scrolls
	lenis.on('scroll', () => ScrollTrigger.update());

	// Run Lenis on GSAP's ticker, so the scroll and the animations update in the same frame
	gsap.ticker.add((time) => lenis.raf(time * 1000));
	gsap.ticker.lagSmoothing(0);
};

const scroll = () => {
	// Loop through each grid item to add animations
	gridItems.forEach((item) => {
		// Get the previous element sibling for the current item
		const previousElementSibling = item.previousElementSibling;
		// Determine if the current item is on the left side based on its position relative to the previous item
		// (functions, so they're measured again when ScrollTrigger refreshes after a resize)
		const isLeftSide = () => previousElementSibling && (item.offsetLeft + item.offsetWidth <= previousElementSibling.offsetLeft + 1);
		// Determine the origin for transformations (either 100 or 0 depending on position)
		const originX = () => isLeftSide() ? 100 : 0;

		gsap
		.timeline({
			defaults: {
				ease: 'power2'
			},
			scrollTrigger: {
				trigger: item,
				start: 'top bottom',
				end: '+=75%',
				scrub: true,
				invalidateOnRefresh: true
			}
		})
		.fromTo(item.querySelector('.grid__item-img'), {
			rotation: () => isLeftSide() ? -45 : 45,
			opacity: 0,
			transformOrigin: () => `${originX()}% 0%`
		}, {
			rotation: 0,
			opacity: 1
		}, 0)
		.fromTo(item.querySelector('.grid__item-caption'), {
			rotation: () => isLeftSide() ? -45 : 45,
			xPercent: () => isLeftSide() ? -150 : 150,
			yPercent: 500,
			opacity: 0,
			transformOrigin: () => `${originX()}% 0%`
		}, {
			ease: 'sine',
			rotation: 0,
			xPercent: 0,
			yPercent: 0,
			opacity: 1
		}, 0);

	});
}

// Preload images, initialize smooth scrolling, apply scroll-triggered animations (or the reduced motion fade), and remove loading class from body
preloadImages('.grid__item-img-inner').then(() => {
	if ( prefersReducedMotion ) {
		fadeOnScroll(gridItems);
	}
	else {
		initSmoothScrolling();
		scroll();
	}
	document.body.classList.remove('loading');
});