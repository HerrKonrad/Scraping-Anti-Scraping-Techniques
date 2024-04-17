
const HoneypotPage = () => {

    localStorage.setItem('honeypot_filled', 'true')
    console.log('Honeypot page visited')
    
    return(
    <div>Ops... You're a bot!!!</div>
    )
    }

    export default HoneypotPage;