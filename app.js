import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBFLgyEkGYB4s68rJSAhQnyJIGGvILFzbc",
  authDomain: "malla-contabilidad-lt.firebaseapp.com",
  projectId: "malla-contabilidad-lt",
  storageBucket: "malla-contabilidad-lt.firebasestorage.app",
  messagingSenderId: "633833387942",
  appId: "1:633833387942:web:242d9de44fd14c8105c167"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const avanceCarrera = document.getElementById('avance-carrera');

loginBtn.addEventListener('click', () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider).catch(console.error);
});

logoutBtn.addEventListener('click', () => {
  signOut(auth).catch(console.error);
});

onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    cargarProgreso(user.uid);
  } else {
    currentUser = null;
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    limpiarMaterias();
    actualizarPorcentaje();
  }
});

// ---------------------------------------------
// Datos de materias
// ---------------------------------------------

const primerTramo = [
  { codigo: "245", nombre: "Álgebra", requisitos: "", aprobada: false, notas: {} },
  { codigo: "241", nombre: "Análisis Matemático 1", requisitos: "", aprobada: false, notas: {} },
  { codigo: "242", nombre: "Economía", requisitos: "", aprobada: false, notas: {} },
  { codigo: "246", nombre: "Historia económica y social general", requisitos: "", aprobada: false, notas: {} },
  { codigo: "244", nombre: "Metodología de las Ciencias Sociales", requisitos: "", aprobada: false, notas: {} },
  { codigo: "243", nombre: "Sociología", requisitos: "", aprobada: false, notas: {} }
];

const segundoTramo = [
  { codigo: "248", nombre: "Estadística 1", requisitos: "1er Tramo", aprobada: false, notas: {} },
  { codigo: "252", nombre: "Administración General", requisitos: "1er Tramo", aprobada: false, notas: {} },
  { codigo: "250", nombre: "Microeconomía 1", requisitos: "1er Tramo", aprobada: false, notas: {} },
  { codigo: "247", nombre: "Teoría contable", requisitos: "1er Tramo", aprobada: false, notas: {} },
  { codigo: "249", nombre: "Historia económica y social argentina", requisitos: "1er Tramo", aprobada: false, notas: {} },
  { codigo: "251", nombre: "Instituciones del Derecho Público", requisitos: "1er Tramo", aprobada: false, notas: {} }
];

const cfpMaterias = [
  [
    { codigo: "275", nombre: "Tecnologías de la información", requisitos: "274", aprobada: false, notas: {} },
    { codigo: "278", nombre: "Macroeconomía y política económica", requisitos: "", aprobada: false, notas: {} },
    { codigo: "276", nombre: "Cálculo financiero", requisitos: "248", aprobada: false, notas: {} },
    { codigo: "274", nombre: "Sistemas Administrativos", requisitos: "252", aprobada: false, notas: {} },
    { codigo: "351", nombre: "Sistemas Contables", requisitos: "247", aprobada: false, notas: {} },
    { codigo: "353", nombre: "Sistemas de Costos", requisitos: "247", aprobada: false, notas: {} },
    { codigo: "1359", nombre: "Derecho Económico", requisitos: "", aprobada: false, notas: {} }
  ],
  [
    { codigo: "279", nombre: "Administración Financiera", requisitos: "276", aprobada: false, notas: {} },
    { codigo: "1352", nombre: "Contabilidad Financiera", requisitos: "351|353", aprobada: false, notas: {} },
    { codigo: "362", nombre: "Gestión y costos para contadores", requisitos: "353", aprobada: false, notas: {} },
    { codigo: "273", nombre: "Instituciones del Derecho Privado", requisitos: "1359", aprobada: false, notas: {} }
  ],
  [
    { codigo: "355", nombre: "Auditoría", requisitos: "1352", aprobada: false, notas: {} },
    { codigo: "COD1", nombre: "Optativa", requisitos: "", aprobada: false, notas: {} },
    { codigo: "COD2", nombre: "Optativa", requisitos: "", aprobada: false, notas: {} },
    { codigo: "354", nombre: "Derecho del trabajo y de la seguridad social", requisitos: "251|1359", aprobada: false, notas: {} }
  ],
  [
    { codigo: "1358", nombre: "Taller de Actuación Profesional Judicial", requisitos: "355|1360", aprobada: false, notas: {} },
    { codigo: "356", nombre: "Teoría y Técnica impositiva 1", requisitos: "251|1352", aprobada: false, notas: {} },
    { codigo: "1360", nombre: "Derecho crediticio, bursátil e insolvencia", requisitos: "273|354", aprobada: false, notas: {} }
  ],
  [
    { codigo: "1361", nombre: "Taller de Práctica Profesional en Organizaciones", requisitos: "", aprobada: false, notas: {} },
    { codigo: "357", nombre: "Teoría y Técnica impositiva 2", requisitos: "356", aprobada: false, notas: {} }
  ]
];

// ---------------------------------------------

function renderTramo(tramo, contenedorId, bloqueadoInicialmente) {
  const contenedor = document.getElementById(contenedorId);
  contenedor.innerHTML = "";

  tramo.forEach((m) => {
    const div = crearBloqueMateria(m, bloqueadoInicialmente);
    contenedor.appendChild(div);
    m.divElement = div;
  });
}

function renderCFP() {
  const contenedor = document.getElementById('cfp-contenedor');
  contenedor.innerHTML = "";
  cfpMaterias.forEach(columna => {
    const colDiv = document.createElement("div");
    colDiv.classList.add("columna-tramo");
    columna.forEach(m => {
      const div = crearBloqueMateria(m, true);
      colDiv.appendChild(div);
      m.divElement = div;
    });
    contenedor.appendChild(colDiv);
  });
}

function crearBloqueMateria(m, bloqueado) {
  const div = document.createElement("div");
  div.classList.add("materia");
  if (bloqueado) div.classList.add("bloqueado");

  const header = document.createElement("div");
  const codigo = document.createElement("span");
  codigo.classList.add("codigo");
  codigo.textContent = m.codigo;

  const nombre = document.createElement("span");
  nombre.classList.add("nombre");
  nombre.textContent = m.nombre;

  header.appendChild(codigo);
  header.appendChild(nombre);

  const requisitos = document.createElement("div");
  requisitos.classList.add("requisitos");
  requisitos.textContent = m.requisitos ? "Requiere: " + m.requisitos : "-";

  div.appendChild(header);
  div.appendChild(requisitos);

  const notasDiv = document.createElement("div");
  notasDiv.classList.add("notas");

  ["1P", "2P", "F"].forEach(key => {
    const input = document.createElement("input");
    input.placeholder = key;
    input.value = m.notas[key] || "";
    input.addEventListener("change", () => {
      m.notas[key] = input.value;
      if (currentUser) {
        guardarMateria(currentUser.uid, m);
      }
    });
    notasDiv.appendChild(input);
  });

  div.appendChild(notasDiv);

  div.addEventListener("click", (e) => {
    if (e.target.tagName === "INPUT") return;
    if (!currentUser) {
      alert("Debes iniciar sesión primero.");
      return;
    }
    m.aprobada = !m.aprobada;
    div.classList.toggle("aprobada", m.aprobada);
    guardarMateria(currentUser.uid, m);
    actualizarBloqueo();
    actualizarPorcentaje();
  });

  return div;
}

async function guardarMateria(uid, m) {
  try {
    await setDoc(doc(db, "usuarios", uid, "materias", m.codigo), {
      codigo: m.codigo,
      nombre: m.nombre,
      aprobada: m.aprobada,
      notas: m.notas || {}
    });
  } catch (error) {
    console.error("Error al guardar:", error);
  }
}

async function cargarProgreso(uid) {
  try {
    const snapshot = await getDocs(collection(db, "usuarios", uid, "materias"));
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      let materia = encontrarMateriaPorCodigo(data.codigo);
      if (materia) {
        materia.aprobada = data.aprobada;
        materia.notas = data.notas || {};
        if (materia.divElement) {
          materia.divElement.classList.toggle("aprobada", materia.aprobada);
          materia.divElement.classList.remove("bloqueado");
          materia.divElement.querySelectorAll("input").forEach(input => {
            input.value = materia.notas[input.placeholder] || "";
          });
        }
      }
    });
    actualizarBloqueo();
    actualizarPorcentaje();
  } catch (error) {
    console.error("Error al cargar progreso:", error);
  }
}

function encontrarMateriaPorCodigo(codigo) {
  let m = primerTramo.find(x => x.codigo === codigo);
  if (!m) m = segundoTramo.find(x => x.codigo === codigo);
  if (!m) {
    for (const col of cfpMaterias) {
      m = col.find(x => x.codigo === codigo);
      if (m) break;
    }
  }
  return m;
}

function limpiarMaterias() {
  [...primerTramo, ...segundoTramo, ...cfpMaterias.flat()].forEach(m => {
    m.aprobada = false;
    m.notas = {};
    if (m.divElement) {
      m.divElement.classList.remove("aprobada");
      m.divElement.classList.add("bloqueado");
      m.divElement.querySelectorAll("input").forEach(input => {
        input.value = "";
      });
    }
  });
  actualizarPorcentaje();
}

function actualizarBloqueo() {
  const todosAprobados = primerTramo.every(m => m.aprobada);
  segundoTramo.forEach(m => {
    if (todosAprobados) {
      m.divElement.classList.remove("bloqueado");
    } else {
      m.divElement.classList.add("bloqueado");
      m.aprobada = false;
      m.divElement.classList.remove("aprobada");
    }
  });

  cfpMaterias.forEach(columna => {
    columna.forEach(m => {
      let desbloqueada = true;
      if (m.requisitos && m.requisitos !== "1er Tramo") {
        const reqs = m.requisitos.split("|");
        for (const req of reqs) {
          const matReq = encontrarMateriaPorCodigo(req.trim());
          if (!matReq || !matReq.aprobada) {
            desbloqueada = false;
            break;
          }
        }
      }
      if (desbloqueada && todosAprobados) {
        m.divElement.classList.remove("bloqueado");
      } else {
        m.divElement.classList.add("bloqueado");
        m.aprobada = false;
        m.divElement.classList.remove("aprobada");
      }
    });
  });
}

function actualizarPorcentaje() {
  const materias = [...primerTramo, ...segundoTramo, ...cfpMaterias.flat()];
  const total = materias.length;
  const aprobadas = materias.filter(m => m.aprobada).length;
  const porcentaje = total > 0 ? ((aprobadas / total) * 100).toFixed(2) : 0;
  avanceCarrera.textContent = `Avance: ${porcentaje}%`;
}

renderTramo(primerTramo, "primer-tramo", false);
renderTramo(segundoTramo, "segundo-tramo", true);
renderCFP();
