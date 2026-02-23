import { Carousel, Image } from 'react-bootstrap'
import '../style/Carousel.css'

import image1 from '../assets/1.png';
import image8 from '../assets/8.png';

function HomeCarousel() {
  return (
    <>
      <Carousel fade className='mt-3 pb-4'>
        <Carousel.Item className='custom-item'>
          <div className='split-container'>
            <div className='overlay'>
              <div className='overlay-content'>
                <h1>Pálinka</h1>
              </div>
            </div>
            <Image className='d-block w-100 carousel-img' src={image1} />
          </div>
        </Carousel.Item>
        <Carousel.Item className='custom-item'>
          <div className='split-container'>
            <div className='overlay'>
              <div className='overlay-content'>
                <h1>Whiskey</h1>
              </div>
            </div>
            <Image className='d-block w-100 carousel-img' src={image8} />
          </div>
        </Carousel.Item>
      </Carousel>
    </>
  )
}
export default HomeCarousel;