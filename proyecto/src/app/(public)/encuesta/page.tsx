"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Star, CheckCircle } from "lucide-react";

function SurveyForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [caseId, setCaseId] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Token invalido");
      setLoading(false);
      return;
    }
    fetch(`/api/csat?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setCaseId(data.case_id);
          if (data.responded_at) setAlreadyDone(true);
        }
      })
      .catch(() => setError("Error de conexion"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit() {
    if (!rating) return;
    setLoading(true);
    const res = await fetch("/api/csat", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, rating, comment }),
    });
    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json();
      setError(data.error || "Error al enviar");
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="text-center text-slate-400 py-10">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  if (alreadyDone || submitted) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold text-slate-800">
          {submitted ? "Gracias por su respuesta" : "Encuesta ya respondida"}
        </h2>
        <p className="text-slate-500">
          Su opinion es importante para mejorar nuestro servicio.
        </p>
      </div>
    );
  }

  const labels = ["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">
          Califique nuestro servicio
        </h2>
        <p className="text-slate-500 mt-1">Caso #{caseId}</p>
      </div>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-12 w-12 ${
                star <= (hover || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-300"
              }`}
            />
          </button>
        ))}
      </div>
      {(hover || rating) > 0 && (
        <p className="text-center text-sm font-medium text-slate-600">
          {labels[hover || rating]}
        </p>
      )}
      <div>
        <textarea
          placeholder="Comentarios adicionales (opcional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={!rating}
        className="w-full rounded-md bg-primary px-4 py-3 text-white font-medium hover:bg-primary/90 disabled:opacity-50"
      >
        Enviar calificacion
      </button>
    </div>
  );
}

export default function EncuestaPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm"
      >
        <div className="mb-6 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <p className="mt-1 text-sm text-slate-400">STIA Casos</p>
        </div>
        <Suspense
          fallback={
            <div className="text-center text-slate-400">Cargando...</div>
          }
        >
          <SurveyForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
