document.getElementById('sms').addEventListener('click', async function (e) {
    e.preventDefault();

    const name = document.getElementById('nom').value;
    const tel = document.getElementById('tel').value;
    const message = `Thank you for using our Service! Le client ${name} (${tel}), Nous avons vu votre message veiller vous patienter.`;

    const accountSid = 'AC105c3b5a95e286bdb9241b1c3a478c24'; // Your Account SID
    const authToken = 'c2c973d61446efcbd56492036b162f92'; // Your Auth Token
    const twilioPhoneNumber = "+17754166857"; // Your Twilio Phone Number

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    // Création de l'objet FormData
    const formData = new FormData();
    formData.append('To', tel);
    formData.append('From', twilioPhoneNumber);
    formData.append('Body', message);

    
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
            },
            body: formData,
        });

       

    const result = await response.json();

    if (response.ok) {
        document.getElementById('response').classList.remove('hidden');
        document.getElementById('response').innerText = "Message envoyé avec succès!";
    } else {
        document.getElementById('response').classList.remove('hidden');
        document.getElementById('response').innerText = "Erreur: " + (result.message || "Une erreur s'est produite.");
    }
  
});