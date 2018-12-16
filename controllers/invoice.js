var fs = require('fs');

const createInvoice = (myDoc, user_name ,invoice_num, adress, postal_code, city, email, phone_num, order_name, order_num, price, date) =>{
    myDoc.pipe(fs.createWriteStream(`./Faktury/faktura-${invoice_num}.pdf`));

    myDoc.font('Times-Roman').fontSize(20).text(`Faktura c.${invoice_num.toString()}`,10,10);
    myDoc.font('Times-Roman').fontSize(8).text(`APIS zadanie`, 10, 30);

    myDoc.font('Times-Roman').fontSize(14).text(`Predavajuci:`, 20, 50);
    myDoc.font('Times-Roman').fontSize(14).text(`Kupujuci:`, 255, 50);

    myDoc.moveTo(10, 70)
            .lineTo(500, 70)//okolo
            .lineTo(500,250)
            .lineTo(10, 250)
            .lineTo(10,70)

            .moveTo(245,70)//stredna ciara
            .lineTo(245, 250)

            .moveTo(10, 100)
            .lineTo(500,100)//druhy riadok

            .moveTo(10, 130)
            .lineTo(500,130)

            .moveTo(10, 160)
            .lineTo(500,160)

            .moveTo(10, 190)
            .lineTo(500,190)

            .moveTo(10, 220)
            .lineTo(500,220)//prvy riadok

            .stroke();

    myDoc.font('Times-Roman').fontSize(13).text('Raketaci s.r.o.', 20, 80);
    myDoc.font('Times-Roman').fontSize(13).text('Park Komenskeho 6', 20, 110);
    myDoc.font('Times-Roman').fontSize(13).text('040 01', 20, 140);
    myDoc.font('Times-Roman').fontSize(13).text('Kosice', 20, 170);
    myDoc.font('Times-Roman').fontSize(13).text('najlepsierakety@gmail.com', 20, 200);
    myDoc.font('Times-Roman').fontSize(13).text('+421 XXX XXX XXX', 20, 230);

    myDoc.font('Times-Roman').fontSize(13).text(`${user_name}`, 255, 80);
    myDoc.font('Times-Roman').fontSize(13).text(`${adress}`, 255, 110);
    myDoc.font('Times-Roman').fontSize(13).text(`${postal_code}`, 255, 140);
    myDoc.font('Times-Roman').fontSize(13).text(`${city}`, 255, 170);
    myDoc.font('Times-Roman').fontSize(13).text(`${email}`, 255, 200);
    myDoc.font('Times-Roman').fontSize(13).text(`${phone_num}`, 255, 230);

    myDoc.font('Times-Roman').fontSize(15).text('Informacie o objednanom tovare:',10, 300);

    myDoc.moveTo(10, 330)
            .lineTo(600,330)
            .lineTo(600, 370)
            .lineTo(10, 370)
            .lineTo(10, 330)

            .moveTo(207, 330)
            .lineTo(207, 370)

            .moveTo(404, 330)
            .lineTo(404, 370)

            .moveTo(10, 350)
            .lineTo(600, 350)
            .stroke();

    myDoc.font('Times-Roman').fontSize(10).text('NAZOV', 20, 336);
    myDoc.font('Times-Roman').fontSize(10).text('MNOZSTVO', 217, 336);
    myDoc.font('Times-Roman').fontSize(10).text('CENA', 414, 336);

    myDoc.font('Times-Roman').fontSize(10).text(`${order_name}`, 20, 356);
    myDoc.font('Times-Roman').fontSize(10).text(`1`, 217, 356);
    myDoc.font('Times-Roman').fontSize(10).text(`${price}€`, 414, 356);

    myDoc.font('Times-Roman').fontSize(13).text(`Objednavka vytvorena dna ${date}.`, 10, 700)
    myDoc.font('Times-Roman').fontSize(11).text('S pozdravom spolocnost:' ,420, 680)
    myDoc.font('Times-Roman').fontSize(11).text('Raketaci s.r.o.' ,450, 700)

    myDoc.end();
}


module.exports = {createInvoice};