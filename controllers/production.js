const production = (count) => {
    var status='';
    var productions_parts = [
        'zaciatok vyroby',
        'zhotovenie ramu',
        'nasadenie gripu',
        'nasadenie vypletu',
        'kontrola kvality',
        'koniec vyroby'
    ];

        product1 = new Promise((resolve, reject)=>{
            setTimeout(()=> {
                resolve(productions_parts[0]);
            }, count);
            
        })
        product2 = new Promise((resolve, reject)=>{
            setTimeout(()=> {
                resolve(productions_parts[1]);
            }, 2*count); 
        })
        product3 = new Promise((resolve, reject)=>{
            setTimeout(()=> {
                resolve(productions_parts[2]);
            }, 3*count); 
        })
        product4 = new Promise((resolve, reject)=>{
            setTimeout(()=> {
                resolve(productions_parts[3]);
            }, 4*count); 
        })
        product5 = new Promise((resolve, reject)=>{
            setTimeout(()=> {
                resolve(productions_parts[4]);
            }, 5*count); 
        })
        product6 = new Promise((resolve, reject)=>{
            setTimeout(()=> {
                resolve(productions_parts[5]);
            }, 6*count); 
        })
    //ZACINANIE PROMISOV
        product1.then(function(value) {
            this.status = value;
            console.log(this.status);
        });
        product2.then(function(value) {
            this.status = value;
            console.log(this.status);
        });
        product3.then(function(value) {
            this.status = value;
            console.log(this.status);
        });
        product4.then(function(value) {
            this.status = value;
            console.log(this.status);
        });
        product5.then(function(value) {
            this.status = value;
            console.log(this.status);
        });
        product6.then(function(value) {
            this.status = value;
            console.log(this.status);
        });

        console.log(status)
}
    

module.exports = production 