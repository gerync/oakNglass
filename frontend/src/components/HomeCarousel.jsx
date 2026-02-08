import { Carousel, Image } from 'react-bootstrap'

import '../style/Carousel.css'
function HomeCarousel() {
  return (
    <>
      <Carousel fade>
        <Carousel.Item className='custom-item'>
          <div className='split-container'>
            <div className='overlay'>
              <div className='overlay-content'>
                <h1>Első slide</h1>
              </div>
            </div>
            <Image className='d-block w-100 carousel-img' src='src/assets/kep.png' />
          </div>
        </Carousel.Item>
        <Carousel.Item className='custom-item'>
          <div className='split-container'>
            <div className='overlay'>
              <div className='overlay-content'>
                <h1>Második slide</h1>
              </div>
            </div>
            <Image className='d-block w-100 carousel-img' src='src/assets/kep.png' />
          </div>
        </Carousel.Item>
      </Carousel>
    </>
  )
}
export default HomeCarousel;