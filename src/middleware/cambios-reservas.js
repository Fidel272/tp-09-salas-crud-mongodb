function validarReemplazoReserva(req, res, next) {
    const datos = req.body;

    const permitidos = [
        "estudiante",
        "email",
        "sala",
        "fecha",
        "turno",
        "personas",
        "estado",
    ];

    // Verificar que no envíen campos extra o prohibidos (como _id)
    for (const campo of Object.keys(datos)) {
        if (!permitidos.includes(campo)) {
            return res.status(400).json({ error: `El campo ${campo} no se puede modificar.` });
        }
    }

    // Validar presencia y tipos de los 7 campos exigidos por PUT
    const { estudiante, email, sala, fecha, turno, personas, estado } = datos;

    if (!estudiante || typeof estudiante !== "string" || !estudiante.trim()) {
        return res.status(400).json({ error: "El campo estudiante es obligatorio y debe ser texto." });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ error: "El email es obligatorio y debe contener '@'." });
    }
    const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
    if (!salasPermitidas.includes(sala)) {
        return res.status(400).json({ error: "Sala inválida o no permitida." });
    }
    if (!fecha || typeof fecha !== "string" || !fecha.trim()) {
        return res.status(400).json({ error: "La fecha es obligatoria." });
    }
    const turnosPermitidos = ["Mañana", "Tarde", "Noche"];
    if (!turnosPermitidos.includes(turno)) {
        return res.status(400).json({ error: "Turno inválido o no permitido." });
    }
    if (
        typeof personas !== "number" ||
        !Number.isInteger(personas) ||
        !Number.isFinite(personas) ||
        personas < 1 ||
        personas > 6
    ) {
        return res.status(400).json({ error: "Personas debe ser un número entero entre 1 y 6." });
    }
    if (estado !== "pendiente" && estado !== "confirmada") {
        return res.status(400).json({ error: "El estado debe ser 'pendiente' o 'confirmada'." });
    }

    // Construir los cambios limpios y seguros
    req.cambiosValidos = {
        estudiante: estudiante.trim(),
        email: email.trim(),
        sala,
        fecha: fecha.trim(),
        turno,
        personas,
        estado,
    };

    next();
}

function validarActualizacionReserva(req, res, next) {
    const datos = req.body;
    if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
        return res.status(400).json({ error: "Envía un objeto JSON." });
    }

    for (const campo of Object.keys(datos)) {
        if (campo !== "personas" && campo !== "estado") {
            return res.status(400).json({ error: "Solo se puede cambiar personas o estado." });
        }
    }

    if (datos.personas === undefined && datos.estado === undefined) {
        return res.status(400).json({ error: "Envía personas o estado." });
    }

    const cambios = {};

    if (datos.personas !== undefined) {
        if (
            typeof datos.personas !== "number" ||
            !Number.isInteger(datos.personas) ||
            !Number.isFinite(datos.personas) ||
            datos.personas < 1 ||
            datos.personas > 6
        ) {
            return res.status(400).json({ error: "Personas debe ser un entero entre 1 y 6." });
        }
        cambios.personas = datos.personas;
    }

    if (datos.estado !== undefined) {
        if (datos.estado !== "pendiente" && datos.estado !== "confirmada") {
            return res.status(400).json({ error: "Estado debe ser pendiente o confirmada." });
        }
        cambios.estado = datos.estado;
    }

    req.cambiosValidos = cambios;
    next();
}

module.exports = {
    validarReemplazoReserva,
    validarActualizacionReserva,
};