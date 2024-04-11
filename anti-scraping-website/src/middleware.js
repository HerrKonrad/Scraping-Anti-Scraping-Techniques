const modifyDataMiddleware = store => next => action => {
    // Check for FETCH_DATA action
    if (action.type === 'FETCH_DATA') {
      const modifiedData = action.payload.map(car => {
        // Modify address and price (optional, customize logic)
        car.car_model = modifyContent(car.car_model);
        car.car_make = modifyContent(car.car_make);
        car.car_price = modifyContent(car.car_price);   
        car.car_vin = modifyContent(car.car_vin);
        car.car_color = modifyContent(car.car_color);     
        return car;
      });
  
      // Dispatch new action with modified data
      store.dispatch({ type: 'FETCH_MODIFIED_DATA', payload: modifiedData });
    }
  
    // Pass through to next middleware or reducer
    return next(action);
  };
  
  const modifyContent = (content) => {
    // Validate content as a string
    if (content.length > 0) {
      if (content.type !== 'string') {
        content = String(content);
      }
      const numberOfSpans = 1;
      let modifiedContent = content;
      
      for (let i = 0; i < numberOfSpans; i++) {
          const positionOfSpan = Math.floor(Math.random() * modifiedContent.length);
          const randomString = generateRandomString();
          
          // Create span element with random string
          const spanElement = `<span class="hide">${randomString}<span></span></span>`;
          const applyRandomization = process.env.REACT_APP_APPLY_MARKUP_RANDOMIZATION || false;
        
          if(applyRandomization === 'true')
          {
           
        // Insert span element at random position
        modifiedContent = `<span>${ modifiedContent.substring(0, positionOfSpan)}<span></span></span>` +
        spanElement +
        `<span>${modifiedContent.substring(positionOfSpan)}<span></span></span>`;
          }
          else
          {
            modifiedContent = `<span>${modifiedContent} <span></span></span>`;
          }
          
      }
      
      return (
        <div dangerouslySetInnerHTML={{ __html: modifiedContent }}></div>
    );  } else {
      return content; // Return original content if not a string
  }
  };
  
  const generateRandomString = (length = 10) => {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomString = '';
  
    for (let i = 0; i < length; i++) {
      randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  
    return randomString;
  };
  
  export default modifyDataMiddleware;