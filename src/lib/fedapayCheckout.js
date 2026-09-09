const CHECKOUT_SCRIPT_SRC = 'https://cdn.fedapay.com/checkout.js?v=1.1.7';

export const loadFedaPayCheckout = () => {
    if (window.FedaPay) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${CHECKOUT_SCRIPT_SRC}"]`);

        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Unable to load FedaPay checkout')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = CHECKOUT_SCRIPT_SRC;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Unable to load FedaPay checkout'));
        document.body.appendChild(script);
    });
};
