export default class Slider {
	constructor(slides, callback = () => {}) {
		this.slides = slides

		window.addEventListener('scroll', this.onScroll)
		window.addEventListener('resize', this.updateLayout)

		this.pixelsPerSlide = 200
		this.offsets = []
		this.heights = []
		this.scrolls = []
		this.current = 0
		this.lock = false
		this.init()
		this.updateLayout()
		this.callback = callback
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

		if (!this.lock) {
			if (index !== this.current) {
				this.slide(index, true)
			} else if (this.scrolls[this.current]) {
				const halfOffset = this.pixelsPerSlide / 2

				previousOffset -= this.offsets[index]
				previousHeight -= this.heights[index]

				if (
					previousOffset + halfOffset < scrollTop &&
					previousOffset + halfOffset + this.scrolls[this.current] > scrollTop
				) {
					this.slides[this.current].style.position = 'absolute'
					this.setTransform(this.slides[this.current], previousHeight - previousOffset - halfOffset)
				} else if (previousOffset + halfOffset >= scrollTop) {
					this.slides[this.current].style.position = 'fixed'
					this.setTransform(this.slides[this.current], previousHeight)
				} else if (previousOffset + halfOffset + this.scrolls[this.current] <= scrollTop) {
					this.slides[this.current].style.position = 'fixed'
					this.setTransform(this.slides[this.current], previousHeight + this.scrolls[this.current])
				}
			}
		}
	}

	init = () => {
		this.slides.forEach((slide) => {
			slide.style.position = 'fixed'
		})
	}

	updateLayout = () => {
		let previousHeight = 0
		let previousOffset = 0
		let bodyHeight = 0

		this.scrolls.splice(0)
		this.offsets.splice(0)
		this.heights.splice(0)
		this.slides.forEach((slide, index) => {
			const scrollHeight = Math.max(0, slide.offsetHeight - window.innerHeight)
			const slideHeight = slide.offsetHeight - scrollHeight
			const offset = this.pixelsPerSlide + scrollHeight

			slide.style.position = 'fixed'
			slide.style.top = previousHeight + 'px'
			this.scrolls.push(scrollHeight)
			this.offsets.push(offset)
			this.heights.push(slideHeight)

			if (index < this.slides.length - 1) {
				previousHeight += slideHeight
				bodyHeight += offset
			}

			if (index < this.current) {
				previousOffset += slideHeight
			}

			this.setTransform(slide, previousOffset)
		})

		document.body.style.height = '100vh'
		document.body.style.paddingBottom = bodyHeight + 'px'
		this.onScroll()
	}

	slide = (current, slideSibling = false) => {
		const slideUp = slideSibling && current < this.current
		const slideDown = slideSibling && current > this.current
		const originOffsets = []
		const offsets = []
		let index = 0
		let originPreviousHeight = 0
		let previousHeight = 0
		let previousOffset = 0

		this.lock = true

		for (index = 0; index < this.slides.length; index++) {
			if (index < this.current) {
				originPreviousHeight += this.heights[index]
			}

			if (index < current) {
				originOffsets.push(originPreviousHeight + this.scrolls[index])

				previousOffset += this.offsets[index]
				previousHeight += this.heights[index]

				offsets.push(previousHeight + this.scrolls[index])
			}

			if (index === current) {
				originOffsets.push(originPreviousHeight + (slideUp ? this.scrolls[index] : 0))
				offsets.push(previousHeight + (slideUp ? this.scrolls[index] : 0))
			}

			if (index > current) {
				originOffsets.push(originPreviousHeight)
				offsets.push(previousHeight)
			}
		}

		startAmination(500, (progress) => {
			for (index = 0; index < this.slides.length; index++) {
				this.setTransform(
					this.slides[index],
					calcValueTransition(originOffsets[index], offsets[index], easeInOut(progress))
				)
			}
		}, () => {
			this.current = current
			this.callback(current)
			this.lock = false
			this.onScroll()
		})
	}

	setTransform = (slide, translate) => {
		slide.style.transform = 'translateY(' + (-translate) + 'px)'
	}

	destroy = () => {
		window.removeEventListener('scroll', this.onScroll)
		window.removeEventListener('resize', this.updateLayout)
		document.body.style.height = ''
		document.body.style.paddingBottom = ''

		this.slides.forEach((slide) => {
			slide.style.transform = ''
			slide.style.position = ''
			slide.style.top = ''
		})
	}
}

function startAmination(duration, callback, finish) {
	let startAminationTime = null

	requestAnimationFrame(function measure(time) {
		if (!startAminationTime) {
			startAminationTime = time
		}

		const progress = (time - startAminationTime) / duration

		callback(progress)

		if (progress < 1) {
			requestAnimationFrame(measure)
		} else {
			callback(1)
			finish()
		}
	})
}

function easeInOut(time) {
	return 0.5 * (1 - Math.cos(Math.PI * time))
}

function calcValueTransition(beginValue, finishValue, progress) {
	return beginValue + (finishValue - beginValue) * progress
}
