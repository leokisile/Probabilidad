import { poisson } from './poisson.js';

export function simularHospital(lambda, capacidad) {
    const hospital = document.getElementById("hospital");
    hospital.innerHTML = "";

    let eventos = poisson(lambda);

    for (let i = 0; i < eventos; i++) {
        setTimeout(() => {
            let div = document.createElement("div");
            div.className = "paciente";

            if (i >= capacidad) {
                div.classList.add("overflow");
            }

            div.style.left = (i * 12) + "px";
            hospital.appendChild(div);
        }, i * 150);
    }
}