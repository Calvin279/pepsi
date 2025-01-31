document.addEventListener('DOMContentLoaded', () => {
    let registros = JSON.parse(localStorage.getItem('registros')) || [];
    
    const form = document.getElementById('registroForm');
    const buscador = document.getElementById('buscador');
    const btnLimpiar = document.getElementById('limpiarRegistros');

    function calcularTiempoTotal(entrada, salida) {
        const [horasEntrada, minutosEntrada] = entrada.split(':');
        const [horasSalida, minutosSalida] = salida.split(':');
        
        const fechaEntrada = new Date(2000, 0, 1, horasEntrada, minutosEntrada);
        const fechaSalida = new Date(2000, 0, 1, horasSalida, minutosSalida);
        
        const diferencia = fechaSalida - fechaEntrada;
        const horas = Math.floor(diferencia / 3600000);
        const minutos = Math.floor((diferencia % 3600000) / 60000);
        const segundos = Math.floor((diferencia % 60000) / 1000);
        
        return {
            total: diferencia,
            texto: `${horas}h ${minutos}m ${segundos}s`,
            horas: horas + (minutos/60) + (segundos/3600)
        };
    }

    function actualizarTablas() {
        actualizarTablaRegistros();
        actualizarResumenSemanal();
    }

    function actualizarTablaRegistros() {
        const tbody = document.querySelector('#registrosTable tbody');
        tbody.innerHTML = '';

        registros.forEach(registro => {
            const tiempo = calcularTiempoTotal(registro.horaEntrada, registro.horaSalida);
            const cumpleTresHoras = tiempo.horas >= 3;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${registro.nombre}</td>
                <td>${registro.rango}</td>
                <td>${registro.fecha}</td>
                <td>${registro.horaEntrada}</td>
                <td>${registro.horaSalida}</td>
                <td>${tiempo.texto}</td>
                <td class="${cumpleTresHoras ? 'cumplido' : 'no-cumplido'}">
                    ${cumpleTresHoras ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function actualizarResumenSemanal() {
        const resumenPorPersona = {};
        
        registros.forEach(registro => {
            const tiempo = calcularTiempoTotal(registro.horaEntrada, registro.horaSalida);
            if (!resumenPorPersona[registro.nombre]) {
                resumenPorPersona[registro.nombre] = 0;
            }
            resumenPorPersona[registro.nombre] += tiempo.horas;
        });

        actualizarTablaResumen(resumenPorPersona);
        actualizarTablasClasificadas(resumenPorPersona);
    }

    function actualizarTablaResumen(resumen) {
        const tbody = document.querySelector('#resumenSemanal tbody');
        tbody.innerHTML = '';

        Object.entries(resumen).forEach(([nombre, horas]) => {
            const cumple28Horas = horas >= 28;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${nombre}</td>
                <td>${horas.toFixed(2)}h</td>
                <td class="${cumple28Horas ? 'cumplido' : 'no-cumplido'}">
                    ${cumple28Horas ? '<i class="fas fa-smile"></i>' : '<i class="fas fa-frown"></i>'}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function actualizarTablasClasificadas(resumen) {
        const tbodyCumplieron = document.querySelector('#tablaCumplieron tbody');
        const tbodyNoCumplieron = document.querySelector('#tablaNoCumplieron tbody');
        
        tbodyCumplieron.innerHTML = '';
        tbodyNoCumplieron.innerHTML = '';

        Object.entries(resumen).forEach(([nombre, horas]) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${nombre}</td>
                <td>${horas.toFixed(2)}h</td>
            `;

            if (horas >= 28) {
                tbodyCumplieron.appendChild(tr);
            } else {
                tbodyNoCumplieron.appendChild(tr);
            }
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nuevoRegistro = {
            nombre: document.getElementById('nombre').value,
            rango: document.getElementById('rango').value,
            fecha: document.getElementById('fecha').value,
            horaEntrada: document.getElementById('horaEntrada').value,
            horaSalida: document.getElementById('horaSalida').value
        };

        registros.push(nuevoRegistro);
        localStorage.setItem('registros', JSON.stringify(registros));
        
        const tiempo = calcularTiempoTotal(nuevoRegistro.horaEntrada, nuevoRegistro.horaSalida);
        if (tiempo.horas < 3) {
            alert('¡Advertencia! No se han cumplido las 3 horas mínimas requeridas.');
        }

        form.reset();
        actualizarTablas();
    });

    buscador.addEventListener('input', (e) => {
        const busqueda = e.target.value.toLowerCase();
        const filas = document.querySelectorAll('#registrosTable tbody tr');
        
        filas.forEach(fila => {
            const nombre = fila.children[0].textContent.toLowerCase();
            fila.style.display = nombre.includes(busqueda) ? '' : 'none';
        });
    });

    btnLimpiar.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas eliminar todos los registros?')) {
            registros = [];
            localStorage.setItem('registros', JSON.stringify(registros));
            actualizarTablas();
        }
    });

    actualizarTablas();
});