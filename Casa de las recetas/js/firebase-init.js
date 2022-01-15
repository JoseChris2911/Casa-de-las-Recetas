import {
    initializeApp
} from 'https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js'
// Add Firebase products that you want to use
import {
    getAuth,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    signInWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js'

import {
    collection,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    increment,
    setDoc,
    query,
    where,
    orderBy,
    getDoc,
    getFirestore
} from 'https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js'

const firebaseConfig = {
    apiKey: "AIzaSyDPUxtW5wPPV157SrmEcHDdPENyCA2BKRY",
    authDomain: "proyecto2021-f068f.firebaseapp.com",
    projectId: "proyecto2021-f068f",
    storageBucket: "proyecto2021-f068f.appspot.com",
    messagingSenderId: "183276372447",
    appId: "1:183276372447:web:68ec2d994d2f1e6cd2846a",
    measurementId: "G-5FP9YZ8ELL"
};
// Initialize Firebase
//reseteo cookies
setCookie("username", "", 0)
setCookie("userid", "", 0)
//añado las variables necesarias
const app = initializeApp(firebaseConfig);
const auth = getAuth();
let favoritas = false
//no recordemos al usuario
signOut(auth).then(() => {
    // Sign-out successful.
    console.log("fuera sesion")
}).catch((error) => {
    // An error happened.
});
//storage es de pago, asi que me conformo con poner una url
const db = getFirestore();

bindforms()
//metodo que recoje todos los onClick de botones que ya existen
function bindforms() {
    $("#formreg").find('#registrar').click(function (event) {

        let name = $(document.forms.formreg).find('#namereg').val();
        let email = $(document.forms.formreg).find('#emailreg').val();
        let password = $(document.forms.formreg).find('#passreg').val();

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                //cerrar modal
                $("#modalreg").modal('hide')
                //informacion actual del usuario
                const user = userCredential.user;
                console.log(user.email)
                //auth = getAuth();
                updateprofile(name)
                profilechanger(name)
                cargarCartas()
            })
            .catch((error) => {
                mostrarErrorRegister()
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode)
                console.log(errorMessage)
            });

    });
    $("#formlogin").find('#iniciar').click(function (event) {

        let email = $(document.forms.formlogin).find('#emaillogin').val();
        let password = $(document.forms.formlogin).find('#passlogin').val();
        //console.log(email, pass)

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                //si ha tenido exito, cerramos la modal
                $("#modallogin").modal('hide')
                const user = userCredential.user;
                //cambiamos la interfaz
                $("#formlogin").find('#error').empty()
                profilechanger()
                cargarCartas()
            })
            .catch((error) => {
                mostrarErrorLogin()
                //const errorCode = error.code;
                //const errorMessage = error.message;
            });

        //console.log("YAAAS")

    });
    $("#logout").click(function (event) {
        signOut(auth).then(() => {
            // Sign-out successful.
            favoritas = false
            profilechanger()
            cargarCartas()
        }).catch((error) => {
            // An error happened.
        });
    });
    //que filtro hay?
    $('#filter').find('#buscar').click(async function (event) {
        let word = $('#filter').find('#wordfilter').val()
        cargarCartas(word)
    });
    //quitar mensajes de error
    $("#formlogin").find('button').click(function (event) {
        $("#formlogin").find('#errorlog').empty()
    });
    $("#formreg").find('button').click(function (event) {
        $("#formreg").find('#errorreg').empty()
    });
    $('#modalprofile').find('#verrec').click(async function (event) {
        $(".profilesetting").find('#cancelsaw').remove()
        favoritas = false
        let autor = getCookie("username")
        cargarCartas(autor)
        let buttoncancel = '<button type="button" id="cancelsaw" alt="cancel" class="mt-1 btn btn-danger">Dejar de ver</button>'
        $(".profilesetting").append(buttoncancel)
    });
    $('#modalprofile').find('#verfav').click(async function (event) {
        $(".profilesetting").find('#cancelsaw').remove()
        favoritas = true
        cargarCartas()
        let buttoncancel = '<button type="button" id="cancelsaw" alt="cancel" class="mt-1 btn btn-danger">Dejar de ver</button>'
        $(".profilesetting").append(buttoncancel)
    });
    //añadir una receta
    $('#modaladdreceta').find('#addnewrec').click(async function (event) {
        $(".profilesetting").find('#cancelsaw').remove()
        let title = $('#modaladdreceta').find('#addtitle').val()
        let desc = $('#modaladdreceta').find('#adddesc').val()
        let ingredients = $('#modaladdreceta').find('#addingred').val()
        let steps = $('#modaladdreceta').find('#addpasos').val()
        let urlimg = $('#modaladdreceta').find('#addimg').val()

        console.log(getCookie("username"))
        addreceta(title, desc, urlimg, ingredients, steps)

    });

    profilechanger()
}
//este es el boton de probar img
$("#modaladdreceta").find('#btnprobarimg').click(function (event) {
    let imgprueba = $("#modaladdreceta").find("#imgprueba")
    let url = $(document.forms.addreceta).find("#addimg").val()
    imgprueba.empty()
    checkImage(url)
    console.log("probar img")
});
//este es el boton de borrar la img de prueba
$("#modaladdreceta").find('#borrarurl').click(function (event) {
    $("#modaladdreceta").find("#imgprueba").empty()
    $(document.forms.addreceta).find("#addimg").val('')
    console.log("borrar img")
});

function mostrarErrorLogin() {
    const errorrow = $(`<div class="alert alert-danger" role="alert">
                Correo o contraseña incorrecta
              </div>`);
    $("#formlogin").find('#errorlog').append(errorrow)
}

function mostrarErrorRegister() {
    const errorrow = $(`<div class="alert alert-danger" role="alert">
                Revisa las credenciales (correo en uso, o inexistente)
              </div>`);
    $("#formreg").find('#errorreg').append(errorrow)
}

function profilechanger(name = '') {
    //variables del html para colocar los botones
    let profile = $(".profile")
    let profileset = $(".profilesetting")
    //botones de cuenta e iniciar sesion que se alternaran dependiendo si la sesion esta inciada o no
    let buttonini = '<button type="button" alt="Iniciar sesion" data-bs-toggle="modal" data-bs-target="#modallogin" class="btn btn-info">Iniciar sesion</button>'
    let buttonprofile = '<button type="button" alt="Cuenta" data-bs-toggle="modal" data-bs-target="#modalprofile" class="btn btn-info">Cuenta</button>'
    //para colocar el nombre de usuario
    let namemodal = $("#nombremodal")
    //reinicio de los contenedores
    namemodal.empty()
    profile.empty();
    profileset.empty();
    if (auth.currentUser) {
        //este if es debido a un error de firebase segun sus patch notes
        //este bug consiste en que el nombre de usuario no se puede conseguir de la variable displayname
        //si justo se a iniciado la sesion registrandose por primera vez, si se inicia sesion despues,
        //ya no habra problemas, por eso que si displayname da null, coje el valor del name que le paso
        //del formulario
        if (auth.currentUser.displayName) {
            //normalmente si name no trae nada es por que el nombre esta en la sesion
            name = auth.currentUser.displayName
        }
        profile.append("<h4>Bienvenido " + name + "</h4>")
        profileset.append(buttonprofile)
        namemodal.append("<h4>Nombre: " + name + "</h4>")
        console.log("logeao")
        console.log(auth.currentUser.displayName)
        //cookie necesaria para solventar el bug de firebase que no coje el nombre
        setCookie("username", name, 365)
        //setCookie("userid", auth.currentUser.uid, 365)
        console.log(auth.currentUser.uid)
        console.log(name + "jajajajajaj")
    } else {
        profile.append("<h4>Inicia sesion</h4>")
        profileset.append(buttonini)
        console.log("no logeao")
    }
}

function updateprofile(name = auth.currentUser.displayName, photo = auth.currentUser.photoURL) {
    updateProfile(auth.currentUser, {
        //displayName: "Jane Q. User", photoURL: "https://example.com/jane-q-user/profile.jpg"
        displayName: name,
        photoURL: photo
    }).then(() => {

    }).catch((error) => {
        // An error occurred
        console.log(error)
    });
}


//esta funcion es para comprobar si la imagen existe o no con un XMLHttpRequest
//de esta forma cargamos una imagen y si nos devuelve ok añado la imagen
function checkImage(url) {
    var request = new XMLHttpRequest();
    let imgprueba = $("#modaladdreceta").find("#imgprueba")
    request.open("GET", url, true);
    request.send();
    request.onload = function () {
        request.status;
        if (request.status == 200 && url != '') //if(statusText == OK)
        {
            console.log("image exists");
            //si la imagen ok, se pone
            let img = $(`<img src="${url}" class="card-img" alt="imagen titulo">`)
            imgprueba.append(img);
        } else {
            console.log("image doesn't exist");
            //si no es ok, se pone la imagen error
            let img = $(`<img src="img/noimage.jpg" class="card-img" alt="imagen titulo">`)
            imgprueba.append(img);
        }
    }
}
//////////////////////////////////////////////////////////////////////////////////////////
//parte de las recetas
cargarCartas()

//este filtro era mas ambicioso, pero por limitaciones de firebase no he podido hacerlo,
//me faltaba el comando LIKE para porder filtrar por palabras en frases
//funcion principal que carga las cartas, si hay un filtro puesto, word recive un parametro
async function cargarCartas(word = '') {
    //si el filtro esta activado o no, se traen las recetas necesarias
    console.log("cargar cartas")
    let querySnapshot = undefined
    let existe = false

    //parte del filtro, si esta vacio se traen todas las recetas
    if (word == '') {
        querySnapshot = await getDocs(query(collection(db, "recetas"), orderBy("favs", "desc")));
        console.log("no hay filtro")
        existe = true
    } else {
        console.log(word)
        querySnapshot = await getDocs(query(collection(db, "recetas"), where("autor", "==", word), orderBy("favs", "desc")));
        //hay que mirar si existe algun resultado

        querySnapshot.forEach((doc) => {
            if (doc.id) {
                existe = true;
            }
        });

        console.log("si hay filtro " + word)
    }


    //ya tenemos la coleccion a mostrar por lo que vaciamos el container
    $(".contentrecetas").empty()
    //primera capa de seguridad
    //comprobamos si hay conexion es decir, si se han traido con exito las recetas
    if (existe) {
        //segunda capa de seguridad
        //se comprueba si esta logeado o no, para mostrar los favoritos
        if (auth.currentUser) {

            let userid = auth.currentUser.uid
            let ref = doc(db, "favoritos", userid)
            //debido a que no se pueden hacer llamada mientras estas dentro del foreach, debo sacar primero todos
            //favoritos en un array y compararlos sin llamadas asincronas 
            const docSnap = await getDoc(ref)
            let arrayfavs = docSnap.data().favs
            console.log(docSnap.data().favs)

            querySnapshot.forEach((document) => {
                //tercera capa de seguridad
                //cada card se debe saber si es favorita ya del usuario
                //estos ifs solo son para pasar un parametro en funcion de si es favorita o no
                if (arrayfavs.includes(document.id)) {
                    //si la receta se encuentra dentro de las favoritas del usuario que es un array, 
                    //le paso un parametro de true, que ya se encargara de cambiar el boton
                    crearcard(document, true)
                    console.log("Document data:", docSnap.data());
                    //si el boton de favoritas esta activado solo pinto las de la primera condicion
                } else if(!favoritas) {
                    //si no tiene aun favoritas no le paso nada
                    crearcard(document);
                }
            });
        } else {
            //cargamos las recetas en modo anonimos
            querySnapshot.forEach((document) => {
                crearcard(document);
                console.log(document.id + "=>" + document.data());
            });
        }
        bindButtons()
    } else {
        //no hay conexion o no se han encontrado resultados del filtro
        nohaynada()
    }

}
//funcion que se ejecuta para crear evento onclick
function bindButtons() {

    //funcion onclick de cada receta, pulsa el boton y recoje el id del data-receta
    $('.card-footer').find('a').click(async function (event) {
        console.log("a")
        console.log(this.dataset.receta);
        let ref = this.dataset.receta;
        //la doc ref necesita estos 3 parametros para funcionar
        const docRef = doc(db, "recetas", ref);
        //la ref trae la id de la receta que has pulsado, y con ello tenemos la referencia del doc
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            let titulo = $('#modalinfo').find('h5').empty()
            let ingredientes = $('#modalinfo').find('p#ingredientes').empty()
            let pasos = $('#modalinfo').find('p#pasos').empty()
            titulo.append(`${docSnap.data().titulo}`)
            ingredientes.append(`${docSnap.data().ingredientes}`)
            pasos.append(`${docSnap.data().pasos}`)
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }

    });

    $(".profilesetting").find('#cancelsaw').click(async function (event) {
        favoritas = false
        cargarCartas()
        $(".profilesetting").find('#cancelsaw').remove()
    });

    $('.card').find('#clickablefav').click(async function (event) {
        //si el usuario esta logeado se hace el resguardo
        if (auth.currentUser) {
            //let reffav = this.dataset.favs;
            let refrecid = this.dataset.receta;
            let isfav = this.dataset.isfav;
            console.log(refrecid)
            //si es la primera vez que añade un favorito, se crea un documento para el usuario
            const refuser = doc(db, 'favoritos', auth.currentUser.uid)
            const docSnap = await getDoc(refuser)
            if (!docSnap.exists()) {
                setDoc(doc(db, 'favoritos', auth.currentUser.uid), {
                    favs: [refrecid]
                });
            }
            //si no es favorito de este usuario se suma 1, si ya lo es, se resta
            const ref = doc(db, 'recetas', refrecid);
            if (isfav == "no") {
                //se cambia el numero total de favs en la pagina
                await updateDoc(ref, {
                    favs: increment(1)
                });
                //añado esta como favorita
                await updateDoc(refuser, {
                    favs: arrayUnion(refrecid)
                })
            } else if (isfav == "si") {
                await updateDoc(ref, {
                    favs: increment(-1)
                });
                //quito esta como favorita
                await updateDoc(refuser, {
                    favs: arrayRemove(refrecid)
                })
            } else {
                console.log("algo anda mal")
            }
            cargarCartas()
        } else {
            //si no esta iniciado sesion le abre la modal
            $("#modallogin").modal('show')
        }
    });

}
async function addreceta(title, desc, urlimg = "", ingredients, steps) {
    let author = getCookie("username")
    await addDoc(collection(db, "recetas"), {
        autor: author,
        titulo: title,
        desc: desc,
        idimagen: urlimg,
        ingredientes: ingredients,
        pasos: steps,
        favs: 0,
    });
    favoritas = false
    cargarCartas()
}

function nohaynada() {
    const card = $(`<div class="card">
      <img src="img/error.jpg" class="card-img-top" alt="imagen titulo">
      <div class="card-body">
        <div class="row">
          <div class="col-sm-12">
            <h5 class="card-title">Aqui no hay nadie</h5>
            <p class="card-text">No se han encontrado recetas, pero no te desanimes aqui tienes una pera</p>
          </div>
        </div>
      </div>`)
    $(".contentrecetas").append(card)
}

function crearcard(thisdoc, fav = false) {
    //hay que saber si es favorita o no, por lo que buscamos en la base de datos si coincide la id del documento con alguna
    //del array
    //la coleccion favoritos, cada documento tiene la misma id que la del usuario, por lo que de esta forma se sabe cual
    //es de cual

    const card = $(`<div class="card">
      <img src="${thisdoc.data().idimagen?thisdoc.data().idimagen:"img/noimage.jpg"}" class="card-img-top" alt="imagen titulo">
      <div class="card-body">
        <div class="row">
          <div class="col-sm-12">
            <h5 class="card-title">${thisdoc.data().titulo}</h5>
            <p class="card-text">${thisdoc.data().desc}</p>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <a data-bs-toggle="modal" data-bs-target="#modalinfo" name="cocinar" data-receta="${thisdoc.id}" class="btn btn-primary">¡A cocinar!</a>
        <label for="clickablefav">${thisdoc.data().favs}</label>
        <button id='clickablefav' data-isfav="${fav?'si':'no'}" data-receta="${thisdoc.id}"><i style="color: ${fav?'red':'white'}" class="fa fa-heart"></i></button>
        <span id="infoautor">Cociner@: ${thisdoc.data().autor}</span>
       </div>
      </div>`)
    $(".contentrecetas").append(card)

}
//funciones cookie para que funcione
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}