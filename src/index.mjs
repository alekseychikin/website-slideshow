export default class Slider {
	constructor(slides) {
		this.slides = slides

		window.addEventListener('scroll', this.onScroll)
		window.addEventListener('resize', this.updateLayout)

		this.transitionStyle = 'transform 0.3s ease-in-out'
		this.offsets = []
		this.heights = []
		this.scrolls = []
		this.current = 0
		this.lock = false
		this.init()
		this.updateLayout()
	}

	onScroll = () => {
		const scrollTop = document.body.scrollTop || document.documentElement.scrollTop
		let previousOffset = 0
		let previousHeight = 0
		let index = 0

		for (; index < this.slides.length; index++) {
			previousOffset += this.offsets[index]
			previousHeight += this.heights[index]

			if (previousOffset > scrollTop) {
				break
			}
		}

		// console.log(scrollTop, this.offsets[this.current] + previousOffset)
		// console.log(previousOffset)

		if (index !== this.current) {
			this.slide(index, true)
			this.lock = true
		} else if (!this.lock && this.scrolls[this.current]) {
			previousOffset -= this.offsets[index]
			previousHeight -= this.heights[index]

			const slideScroll = Math.min(previousHeight + this.scrolls[this.current], previousHeight + scrollTop - previousOffset)
			// const slideScroll = previousHeight

			// console.log(slideScroll)

			this.setTransform(this.slides[this.current], slideScroll, '')
		}
	}

	init = () => {
		this.slides.forEach((slide) => {
			slide.style.position = 'fixed'
			slide.style.transition = this.transitionStyle
			slide.addEventListener('transitionend', this.eventHandler)
		})
	}

	updateLayout = () => {
		let previousOffset = 0
		let height = 0

		this.offsets.splice(0)
		this.slides.forEach((slide, index) => {
			const scrollHeight = Math.max(0, slide.offsetHeight - window.innerHeight)
			const slideHeight = slide.offsetHeight - scrollHeight
			const offset = Math.min(100, slideHeight / 2) + scrollHeight

			slide.style.position = 'fixed'
			slide.style.top = `${previousOffset}px`
			this.scrolls.push(scrollHeight)
			this.offsets.push(offset)
			this.heights.push(slideHeight)

			if (index < this.slides.length - 1) {
				previousOffset += slideHeight
				height += offset
			}
		})

		document.body.style.height = `100vh`
		document.body.style.paddingBottom = `${height}px`
	}

	slide = (current, slideSibling = false) => {
		let index = 0
		let previousHeight = 0
		let previousOffset = 0

		for (; index < current; index++) {
			previousHeight += this.heights[index]
			previousOffset += this.offsets[index]
			this.setTransform(this.slides[index], previousHeight, this.transitionStyle)
		}

		this.setTransform(
			this.slides[index],
			previousHeight + (slideSibling && current < this.current ? this.scrolls[index] : 0),
			this.transitionStyle
		)
		// console.log(previousOffset)

		for (++index; index < this.slides.length; index++) {
			this.setTransform(this.slides[index], previousHeight, this.transitionStyle)
		}

		// console.log(previousOffset, this.scrolls[current])
		window.scrollTo(0, previousOffset + (slideSibling && current < this.current ? this.scrolls[current] + this.offsets[current] - 5 : 0))
		this.current = current
	}

	setTransform = (slide, translate, transition) => {
		slide.style.transition = transition
		slide.style.transform = `translateY(${-translate}px)`
	}

	eventHandler = () => {
		this.lock = false
	}
}
