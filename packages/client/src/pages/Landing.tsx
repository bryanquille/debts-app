import { Link } from "@tanstack/react-router";

export default function Landing() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Controla tus deudas en un solo lugar
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Registra tus deudas, lleva el control de tus pagos y comparte los
          comprobantes con quien te prestó. Todo desde una sola app.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
          >
            Comenzar ahora
          </Link>
          <Link
            to="/login"
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-8 mt-20">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Registra deudas</h3>
          <p className="text-gray-600">
            Crea deudas y enlázalas con otros usuarios. Si no están registrados,
            solo agrega su nombre.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Controla pagos</h3>
          <p className="text-gray-600">
            Registra cada abono y sube el comprobante. Tanto tú como el acreedor
            pueden ver el historial.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Visibilidad total</h3>
          <p className="text-gray-600">
            Tanto deudor como acreedor ven los mismos datos. Sin malentendidos,
            sin confusiones.
          </p>
        </div>
      </div>
    </div>
  );
}
