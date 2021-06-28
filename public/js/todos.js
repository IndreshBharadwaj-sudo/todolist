const button = document.getElementById('icon');

function fn() {
    console.log(button.value);
    fetch(`/todo/${button.value}`, {
        method: "POST",
        body: JSON.stringify({
            name: "Deska",
            email: "deska@gmail.com",
            phone: "342234553"
        })
    }).then(result => {
        location.replace("/todo")
    }).catch(err => {
        // if any error occured, then catch it here
        console.error(err);
    });
}