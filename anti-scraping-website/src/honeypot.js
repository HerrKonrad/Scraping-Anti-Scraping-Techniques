
const HoneypotPage = () => {

    localStorage.setItem('honeypot_filled', 'true')
    console.log('Honeypot page visited')
    // Redirect to main page
    window.location.replace('/');
    
    return(
    <div>Ops... You're a bot!!!</div>
    )
    }

    export default HoneypotPage;