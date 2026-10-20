// Import the necessary functions for preloading images and the reduced motion fallback
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
		// (a function, so it's measured again when ScrollTrigger refreshes after a resize)
		const isLeftSide = () => previousElementSibling && (item.offsetLeft + item.offsetWidth <= previousElementSibling.offsetLeft + 1);

		gsap
		.timeline({
			defaults: {
				ease: 'none'
			},
			scrollTrigger: {
				trigger: item,
				start: 'top bottom-=15%',
				end: '+=50%',
				scrub: true,
				invalidateOnRefresh: true
			}
		})
		.fromTo(item.querySelector('.grid__item-img'), {
			yPercent: -100,
			xPercent: () => isLeftSide() ? 100 : -100
		}, {
			yPercent: 0,
			xPercent: 0,
		})
		.fromTo(item.querySelector('.grid__item-img-inner'), {
			yPercent: 100,
			xPercent: () => isLeftSide() ? -100 : 100,
			filter: 'brightness(200%) contrast(300%)'
		}, {
			yPercent: 0,
			xPercent: 0,
			filter: 'brightness(100%) contrast(100%)'
		}, 0)
		.fromTo(item.querySelector('.grid__item-caption'), {
			yPercent: 200,
			xPercent: 50,
			opacity: 0
		}, {
			//ease: 'power1',
			yPercent: 0,
			xPercent: 0,
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
