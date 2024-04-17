import React, { useState } from 'react';
import { Table, Container, Pagination, Button } from 'react-bootstrap';
import {  useDispatch } from 'react-redux'; 
import { useEffect } from 'react';
import { fetchData } from './reducers'; 
import './hide.css'




const MockCars = ({ cars }) => {

    const [currentPage, setCurrentPage] = useState(1);
    const [carsPerPage] = useState(10);
    const dispatch = useDispatch(); // Obtém a função de despacho de ações do Redux

    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1); // Reset page number when search term changes
    };

    const handleHoneyPot = (event) => {
      localStorage.setItem('honeypot_filled', 'true') 
      window.location.reload()
    }
  
    useEffect(() => {
      setCurrentPage(1); // Reset to first page when cars change
    }, [cars]);


    const filteredCars = cars.filter(car => {
      const searchTermLowerCase = searchTerm.toString().toLowerCase(); // Ensure searchTerm is a string before applying toLowerCase()

      if (searchTermLowerCase === '') {
        return true; // Return all cars if searchTerm is empty
      }
      console.log(car.car_make)
      return (car.car_make.toString().toLowerCase().includes(searchTermLowerCase)) ||
             (car.car_model.toString().toLowerCase().includes(searchTermLowerCase)) ||
             (car.car_vin.toString().toLowerCase().includes(searchTermLowerCase)) ||
             (car.car_color.toString().toLowerCase().includes(searchTermLowerCase));
    });
    
    // Get current cars
    const indexOfLastCar = currentPage * carsPerPage;
    const indexOfFirstCar = indexOfLastCar - carsPerPage;
    const currentCars = filteredCars.slice(indexOfFirstCar, indexOfLastCar)


    dispatch(fetchData(currentCars));
  
    // Change page
    const paginate = (pageNumber) => {
      if (pageNumber > 0 && pageNumber <= Math.ceil(cars.length / carsPerPage)) {
        setCurrentPage(pageNumber);
        
      }
    };

    return (
      
      <Container className="mt-5">
        <div>
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div>
          <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={handleHoneyPot}
          className="hide"
          />
        </div>
      <Table striped bordered hover responsive>
        <thead>
        <tr>
          <th>Car Make</th>
          <th>Car Model</th>
          <th>Price</th>
          <th>Car VIN</th>
          <th>Color</th>
        </tr>
        </thead>
        <tbody>
          
        {process.env.REACT_APP_APPLY_HONEYPOT === 'true' && (
  <tr key={0} style={{ display: 'none' }} onClick={() => window.location.href = '/fake-page-1'}>
    <td><div><span></span></div></td>
    <td><div><span></span></div></td>
    <td><div><span></span></div></td>
    <td><div><span></span></div></td>
    <td><div><span></span></div></td>
    <td><div><span><a href={'/fake-page-1'}>More info</a></span></div></td>
  </tr>
)}
        {currentCars.map((car, index) => (
          <tr key={index}>
            <td>{car.car_make}</td>
            <td>{car.car_model}</td>
            <td>{car.car_price}</td>
            <td>{car.car_vin}</td>
            <td>{car.car_color}</td>
            <td><a href={'/' + index}>More info</a></td>
          </tr>
        ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-center mt-3">
        <Pagination>
        <Button className="previouspage" variant="secondary" disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)}>
          Previous
        </Button>
        
        {Array.from({ length: Math.ceil(cars.length / carsPerPage) }, (_, index) => (
            <>
              {currentPage > 1 && process.env.REACT_APP_APPLY_HONEYPOT === 'true' ? (
                <Button
                  key={index}
                  variant={index + 1 === currentPage ? 'primary' : 'secondary'}
                  onClick={() => paginate(index + 1)}
                  
                >
                  {index + 1}
                </Button>
              ) : (
                <Button
                  key={index}
                  variant={index + 1 === currentPage ? 'primary' : 'secondary'}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </Button>
              )}
            </>
          ))}

         
       
        {
          currentPage > 1 && process.env.REACT_APP_APPLY_HONEYPOT === 'true' ?
          <div>
          <Button className="nextpage_real" variant="secondary" disabled={currentPage === Math.ceil(cars.length / carsPerPage)} onClick={() => paginate(currentPage + 1)}>
            Next
          </Button>
          
          <Button className="nextpage" variant="secondary" style={{
            position: 'absolute',
            top: '1px', 
            left: '1px', 
            padding: '0.5em 0.5em',
            border: 'none',
            opacity: '0',
            fontSize: '0.1em',
            textTransform: 'lowercase',
            cursor: 'default',
          }} onClick={() => handleHoneyPot()  }>
           
          </Button> 
          </div>
          :
          <div>
          <Button className="nextpage" variant="secondary" disabled={currentPage === Math.ceil(cars.length / carsPerPage)} onClick={() => paginate(currentPage + 1)}>
          Next
          </Button>
          </div>
        }
        
        </Pagination>
      </div>
      </Container>
      
    );
  };
  


export default MockCars;