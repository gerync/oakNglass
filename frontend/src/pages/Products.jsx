import { Container, Row, Col, Card, Spinner, Button, FloatingLabel, Form, Dropdown } from "react-bootstrap";
import { Slider, Select } from "antd";
import '../style/Products.css';
import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ENDPOINTS } from "../api/endpoints";
import { useSearchParams } from "react-router-dom";
import PaginationComponent from "../components/PaginationComponent";
import ProductCarousel from "../components/ProductCarousel";
import { GlobalContext, CartContext } from "../contexts/Contexts";
import { FaStar, FaRegStar } from "react-icons/fa";

const MAX = {
  ALCOHOL: 70,
  STOCK: 70,
  CONTENT: 1000,
  PRICE: 100000
}

const formatPrice = /\B(?=(\d{3})+(?!\d))/g;

function Products() {

  const { isLoggedIn } = useContext(GlobalContext);
  const { addItemToCart, cart } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(() => {
    return localStorage.getItem('limit') || 6;
  });

  const [fav, setFav] = useState([]);

  const fetchFav = useCallback(async () => {
    try {
      const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.FAVOURITES.GET}`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setFav(data.favourites);
    } catch {
      toast.error('Hiba történt a kedvencek betöltése közben!');
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchFav();
  }, [isLoggedIn, fetchFav]);

  const toggleFav = async (item) => {
    const isFav = fav.some(f => f.ProdID === item.ProdID);
    try {
      const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.FAVOURITES.POST}?productid=${item.ProdID}`, {
        method: isFav ? 'DELETE' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setFav(prev =>
          isFav
            ? prev.filter(f => f.ProdID !== item.ProdID)
            : [...prev, item]
        );
      } else {
        toast.error('Hiba történt a kedvenc módosítása közben!');
      }
    } catch {
      toast.error('Hiba történt a kedvenc módosítása közben!');
    }
  };

  const [sortBy, setSortBy] = useState(() => {
    return localStorage.getItem('sortby') || '';
  });
  const [sortOrder, setSortOrder] = useState(() => {
    return localStorage.getItem('sortorder') || '';
  })

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder)
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('sortorder', newOrder);
      return next;
    });
  };

  const [searchParams, setSearchParams] = useSearchParams();

  const getFiltersFromUrl = () => {
    return {
      minPrice: searchParams.get('minprice'),
      maxPrice: searchParams.get('maxprice'),
      minStock: searchParams.get('minstock'),
      maxStock: searchParams.get('maxstock'),
      minAlcohol: searchParams.get('minalcohol'),
      maxAlcohol: searchParams.get('maxalcohol'),
      minContent: searchParams.get('mincontent'),
      maxContent: searchParams.get('maxcontent'),
    };
  };

  const filters = getFiltersFromUrl();

  const handleSliderChange = (field) => (values) => {
    handleParamChange({
      [`min${field}`]: values[0],
      [`max${field}`]: values[1]
    });
  };

  if (searchParams.size === 0) {
    searchParams.set('page', 1)
  }

  const handleParamChange = (newParamsObject) => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);

      Object.entries(newParamsObject).forEach(([key, value]) => {

        const isMinAtDefault = key.startsWith('min') && value === 0;
        const isMaxAtDefault = key.startsWith('max') && (
          (key.includes('alcohol') && value === MAX.ALCOHOL) ||
          (key.includes('price') && value === MAX.PRICE) ||
          (key.includes('stock') && value === MAX.STOCK) ||
          (key.includes('content') && value === MAX.CONTENT)
        );
        if (value !== null && value !== undefined && !isMinAtDefault && !isMaxAtDefault) {
          nextParams.set(key, value);
        } else {
          nextParams.delete(key);
        }
      });

      if (!newParamsObject.page) nextParams.set('page', 1);
      return nextParams;
    });
  };

  useEffect(() => {
    let ignore = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${ENDPOINTS.BASE_URL}${ENDPOINTS.PRODUCTS.GET_ALL}?limit=${limit}&${searchParams.toString()}`);
        const data = await res.json();

        if (res.ok && !ignore) {
          setProducts(data.products);
          setTotalPages(data.pagination.totalPages);
        }
      } catch {
        if (!ignore) toast.error('Hiba történt az adatok betöltése közben!');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchProducts();
    return () => { ignore = true; }
  }, [searchParams, limit]);

  const handlePageChange = (pageNumber) => {
    setSearchParams(prev => { const next = new URLSearchParams(prev); next.set('page', pageNumber); return next; });
    window.scrollTo(0, 0);
  };


  const [maxInCart, _setMaxInCart] = useState({});

  const setMaxInCart = (id, value) => {
    _setMaxInCart((prev) => {
      return { ...prev, [id]: value };
    })
  }

  useEffect(() => {
    if (isLoggedIn) {
      cart.forEach((item) => {
        if (item && item.count >= item.stock) {
          setMaxInCart(item.ProdID, true);
        }
      })
    }
  }, [isLoggedIn, cart])



  const handleAddToCart = (item) => {
    if (isLoggedIn) {
      const found = cart.find(c => c.ProdID === item.ProdID);
      if (!found || found.count < item.stock) {
        addItemToCart(item)
      } else {
        setMaxInCart(item.ProdID, true);
      }
    }
  }

  return (
    <>
      <Container fluid className="content-bg mt-3">
        <Row>
          <Col md='3' className='pt-3 col-sort'>
            <h3 className="sort-header">Szűrés</h3>
            <div>
              Alkoholtartalom (%)
              <Slider
                range
                step={5}
                tooltip={{ formatter: (value) => `${value}%` }}
                defaultValue={[filters.minAlcohol || 0, filters.maxAlcohol || MAX.ALCOHOL]}
                key={`alcohol-${filters.minAlcohol}-${filters.maxAlcohol}`}
                min={0}
                max={MAX.ALCOHOL}
                onChangeComplete={handleSliderChange('alcohol')}
              />
            </div>
            <div>
              Űrtartalom (ml)
              <Slider
                range
                step={125}
                tooltip={{ formatter: (value) => `${value} ml` }}
                defaultValue={[filters.minContent || 0, filters.maxContent || MAX.CONTENT]}
                key={`content-${filters.minContent}-${filters.maxContent}`}
                min={0}
                max={MAX.CONTENT}
                onChangeComplete={handleSliderChange('content')}
              />
            </div>
            <div>
              Elérhető mennyiség (db)
              <Slider
                range
                step={5}
                defaultValue={[filters.minStock || 0, filters.maxStock || MAX.STOCK]}
                key={`stock-${filters.minStock}-${filters.maxStock}`}
                min={0}
                max={MAX.STOCK}
                onChangeComplete={handleSliderChange('stock')}
              />
            </div>
            <div>
              Ár (Ft)
              <Slider
                range
                step={5000}
                tooltip={{ formatter: (value) => `${value.toString().replace(formatPrice, ".")} Ft` }}
                defaultValue={[filters.minPrice || 0, filters.maxPrice || MAX.PRICE]}
                key={`price-${filters.minPrice}-${filters.maxPrice}`}
                min={0}
                max={MAX.PRICE}
                onChangeComplete={handleSliderChange('price')}
              />
            </div>
            <div className="d-flex align-items-end gap-2 mb-3 w-100">
              <div className="custom-dropdown-container flex-grow-1" style={{ minWidth: 0 }}>
                <label className="dropdown-label">Rendezés</label>

                <Dropdown
                  className="w-100"
                  onSelect={(val) => {
                    localStorage.setItem('sortby', val);
                    setSearchParams(prev => {
                      const next = new URLSearchParams(prev);
                      next.set('sortby', val);
                      return next;
                    });
                    setSortBy(val);
                  }}
                >
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    className="custom-select bg-content text-custom border-secondary shadow-sm w-100 d-flex justify-content-between align-items-center"
                    style={{ height: '58px' }}
                  >
                    {sortBy === 'alphabetical' ? 'A-Z' :
                      sortBy === 'price' ? 'Ár' :
                        sortBy === 'newest' ? 'Legújabb' :
                          sortBy === 'alcoholperc' ? 'Alkohol százalék' :
                            sortBy === 'contentml' ? 'Kiszerelés' :
                              sortBy === 'stock' ? 'Elérhető mennyiség' : 'Rendezés'}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="bg-content border-secondary shadow-lg products">
                    <Dropdown.Item className="products" eventKey="alphabetical" active={sortBy === 'alphabetical'}>A-Z</Dropdown.Item>
                    <Dropdown.Item className="products" eventKey="price" active={sortBy === 'price'}>Ár</Dropdown.Item>
                    <Dropdown.Item className="products" eventKey="newest" active={sortBy === 'newest'}>Legújabb</Dropdown.Item>
                    <Dropdown.Item className="products" eventKey="alcoholperc" active={sortBy === 'alcoholperc'}>Alkohol százalék</Dropdown.Item>
                    <Dropdown.Item className="products" eventKey="contentml" active={sortBy === 'contentml'}>Kiszerelés</Dropdown.Item>
                    <Dropdown.Item className="products" eventKey="stock" active={sortBy === 'stock'}>Elérhető mennyiség</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <Button
                variant="outline-secondary"
                onClick={toggleSortOrder}
                className="bg-content border-secondary shadow-sm d-flex align-items-center justify-content-center"
                style={{ height: '58px', width: '58px', borderRadius: '8px' }}
                title={sortOrder === 'asc' ? 'Növekvő' : 'Csökkenő'}
              >
                <i className={`bi bi-sort-alpha-${sortOrder === 'asc' ? 'down' : 'up-alt'} text-custom fs-4`}></i>
              </Button>
            </div>
          </Col>
          <Col md='9' className='pt-3 col-product'>
            <h3 className="sort-header mb-2">Termékek</h3>
            {
              loading
                ? (<Spinner animation='border' />)
                : (
                  products.length > 0 ?
                    (
                      <Row >
                        {
                          products.map((item) => (
                            <Col xs={12} sm={6} md={6} lg={4} key={item.ProdID}>
                              <Card className="mb-2 custom-card h-100" >
                                <div style={{ position: 'relative' }}>
                                  <ProductCarousel images={item.images} ImageMaxHeight={270} />
                                  {isLoggedIn && (
                                    <button
                                      onClick={() => toggleFav(item)}
                                      title={(fav || []).some(f => f?.ProdID === item?.ProdID) ? 'Eltávolítás a kedvencekből' : 'Hozzáadás a kedvencekhez'}
                                      style={{
                                        position: 'absolute', top: 8, right: 8,
                                        background: 'rgba(255,255,255,0.85)', border: 'none',
                                        borderRadius: '50%', width: 36, height: 36,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', zIndex: 10, fontSize: 18,
                                        color: fav.some(f => f.ProdID === item.ProdID) ? '#f5a623' : '#999',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                                      }}
                                    >
                                      {fav.some(f => f.ProdID === item.ProdID)
                                        ? <FaStar />
                                        : <FaRegStar />}
                                    </button>
                                  )}
                                </div>
                                <Card.Title>{item.name}</Card.Title>
                                <Card.Body className="d-flex flex-column">
                                  <Card.Text>
                                    Kiszerelés: {item.contentML} ml<br />
                                    Alkoholtartalom: {item.alcoholPercent}%<br />
                                    Raktáron: {item.stock} db<br />
                                    Ár: {item.priceHUF.toString().replace(formatPrice, ".")} Forint<br />
                                  </Card.Text>
                                  <Button
                                    size="lg"
                                    className="mt-auto text-truncate"
                                    disabled={item.stock === 0 || !isLoggedIn || maxInCart[item.ProdID]}
                                    onClick={() =>
                                      handleAddToCart(item)
                                    }
                                  >
                                    Kosárba helyezés
                                  </Button>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))
                        }
                      </Row>
                    )
                    : (<>Nem található termék</>)
                )
            }
            {
              products.length !== 0 ?
                (
                  <>
                    <Row>
                      <Col md={12}>
                        <PaginationComponent
                          currentPage={searchParams.get('page')}
                          handlePageChange={handlePageChange}
                          totalPages={totalPages}
                        />
                      </Col><Col>
                        Termékek oldalanként
                        <select
                          name="limit-select"
                          className="limit-select ms-2"
                          onChange={(e) => {
                            localStorage.setItem('limit', e.target.value);
                            setLimit(parseInt(e.target.value));
                          }}
                          defaultValue={limit}
                        >
                          <option value={3}>3</option>
                          <option value={6}>6</option>
                          <option value={9}>9</option>
                          <option value={12}>12</option>
                        </select>
                      </Col>
                    </Row>
                  </>
                ) : (null)
            }

          </Col>
        </Row >
      </Container >
    </>
  )
}

export default Products;
