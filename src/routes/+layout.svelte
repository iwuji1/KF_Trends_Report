<script>
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
	@font-face {
		font-family: "gotham", sans-serif;
		font-style: normal;
		font-display: swap;
		font-weight: 400;
		src: url($lib/assets/fonts/Gotham-Book.otf) format('otf');
	}
</style>