import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set, get, child } from 'firebase/database';
import pkg from 'lodash.throttle'
const {throttle} = pkg;
import _ from 'lodash';







const firebaseApp = initializeApp({
    apiKey: "AIzaSyArXfJvYdcvpTje6Kpvjbe3p0TzLs7Nk4E",
    authDomain: "webcat-tech-test.firebaseapp.com",
    projectId: "webcat-tech-test",
    storageBucket: "webcat-tech-test.appspot.com",
    messagingSenderId: "131272287050",
    appId: "1:131272287050:web:1e86819ec375a2591457b3",
    databaseURL: "https://webcat-tech-test.firebaseio.com"
});

const auth = getAuth();
const db = getDatabase();
const email = 'everalso23@gmail.com';
const password = 'MurxMb5Kfxxtx`#~';



//  throttle(init(), 2000);

// var gfg = _.throttle(function () {
//     console.log('Function throttled after 1000ms!');
// }, 1000);

// gfg();


init()






async function init() {
    try {
        const user = await signInWithEmailAndPassword(auth, email, password).then //conexión a bd
            ((userCredential) => {
                const user = userCredential.user;
                const dbRef = ref(getDatabase());  //escucha el servicio de firebase
                console.log(user.uid);
                get(child(dbRef, "users")).then((snapshot) => {       // recibimos los datos de firebase
                    var returnArr = []
                    if (snapshot.exists()) {
                        snapshot.forEach(function (childSnapshot) {
                            var item = childSnapshot.val();
                            item.key = childSnapshot.key;
                            returnArr.push(item);
                        });                        


                        let result = {                                       //realizamos lógica para inyectar los parámetros necesarios
                            total: returnArr.length,
                            averageAge: getAverage(returnArr.map(obj => (getAge(obj.dateOfBirth)))),
                            byAgeRanges: {
                                '<18': returnArr.filter(obj => getAge(obj.dateOfBirth) < 18).length,
                                '19-29': returnArr.filter(obj => 19 <= getAge(obj.dateOfBirth) && 29 > getAge(obj.dateOfBirth)).length,
                                '30-45': returnArr.filter(obj => 30 <= getAge(obj.dateOfBirth) && 45 > getAge(obj.dateOfBirth)).length,
                                '46-70': returnArr.filter(obj => 46 <= getAge(obj.dateOfBirth) && 70 > getAge(obj.dateOfBirth)).length,
                                '>70': returnArr.filter(obj => 70 < getAge(obj.dateOfBirth)).length

                            },
                            byCountry: {
                            },
                            byVehicle: {
                            }
                        }

                        const average = result.averageAge;
                        const range = result.byAgeRanges;
                        const country = result.byCountry;
                        const vehicle = result.byVehicle;

                        let countries = [...new Set(returnArr.map(m => m.country.replace(/ /g, "").replace(/['"!#%$&/();:<>....etc]/g,'') ))]; //Eliminamos caractéres especiales y extraemos los datos necesarios para inyectar.
                        let vehicleBrands = [...new Set(returnArr.map(m => m.vehicle.replace(/ /g, "")))];

                        for (let i = 0; i < countries.length; i++) {
                            result.byCountry[countries[i]] = returnArr.filter(obj => obj.country.replace(/ /g, "").replace(/['"!#%$&/();:<>....etc]/g,'') == countries[i]).length;
                        }
                        for (let i = 0; i < vehicleBrands.length; i++) {
                            result.byVehicle[vehicleBrands[i]] = returnArr.filter(obj => obj.vehicle.replace(/ /g, "") == vehicleBrands[i]).length;
                        }
                        console.log(result);

                        

                        set(ref(db, 'aggregates/' + user.uid), { //escribimos los datos obtenidos en firebase
                            total: returnArr.length,
                            averageAge:average,
                            byAgeRanges:range,
                            byCountry:country,
                            byVehicle:vehicle 
                          });
                        
                        


                        


                    } else {
                        console.log("No data available");
                    }
                }).catch((error) => {
                    console.error(error);
                });
            })

    } catch (e) {
        console.info("Tiene el siguiente error: ", e)
    }
}

function getAverage(ages) {
    return ages.reduce((a, b) => a + b, 0) / ages.length;
}


function getAge(epoch) {


    epoch = parseInt(epoch);
    var epoch = epoch + (new Date().getTimezoneOffset() * -1);
    return getYears(new Date(epoch));


}


function getYears(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}


