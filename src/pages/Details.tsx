import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Camera, RefreshCw, Check, ArrowLeft, PenTool } from 'lucide-react';


const Details: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const employee = location.state?.employee;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);


  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    if (!photo) startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [photo]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setPhoto(dataUrl);

        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      }
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (signatureRef.current) {
      const ctx = signatureRef.current.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !signatureRef.current) return;

    const canvas = signatureRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e as React.MouseEvent).clientX ? (e as React.MouseEvent).clientX - rect.left : (e as React.TouchEvent).touches[0].clientX - rect.left;
    const y = (e as React.MouseEvent).clientY ? (e as React.MouseEvent).clientY - rect.top : (e as React.TouchEvent).touches[0].clientY - rect.top;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      const ctx = signatureRef.current.getContext('2d');
      ctx?.clearRect(0, 0, signatureRef.current.width, signatureRef.current.height);
    }
  };

  const mergeAndSave = () => {
    if (canvasRef.current && signatureRef.current) {
      const mergedCanvas = document.createElement('canvas');
      mergedCanvas.width = canvasRef.current.width;
      mergedCanvas.height = canvasRef.current.height;
      const ctx = mergedCanvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(canvasRef.current, 0, 0);

        ctx.drawImage(signatureRef.current, 0, 0, mergedCanvas.width, mergedCanvas.height);

        const dataUrl = mergedCanvas.toDataURL('image/png');

        navigate('/analytics', {
          state: {
            mergedImage: dataUrl,
            employee,
            allEmployees: location.state?.allEmployees || []
          }
        });
      }
    }
  };

  if (!employee) {
    return <div className="p-8 text-center text-slate-500">Loading employee details...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Identity Verification</h1>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{employee.name}</h2>
              <p className="text-slate-500 font-medium">ID: {id} • {employee.city}</p>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${photo ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {photo ? 'Photo Captured' : 'Photo Required'}
            </div>
          </div>

          <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden mb-8 shadow-inner border-2 border-slate-100">
            <canvas ref={canvasRef} className="hidden" />

            {!photo ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover mirror"
                />
                <div className="absolute inset-0 border-2 border-white/20 pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-dashed border-white/40 rounded-full"></div>
                </div>
                <button
                  onClick={takePhoto}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-full text-white hover:scale-110 active:scale-95 transition-all shadow-xl"
                >
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </button>
              </>
            ) : (
              <div className="relative w-full h-full">
                <img src={photo} alt="Captured" className="w-full h-full object-cover" />

                <canvas
                  ref={signatureRef}
                  width={800} 
                  height={450}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={endDrawing}
                  className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                />

                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => { setPhoto(null); }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-lg text-white hover:bg-white/20 transition-all"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={clearSignature}
                    className="bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-lg text-white hover:bg-white/20 transition-all"
                  >
                    <PenTool className="w-5 h-5" />
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none">
                  <p className="text-white/70 text-sm font-medium bg-black/40 backdrop-blur-sm inline-block px-4 py-1 rounded-full">
                    Sign slowly on the photo for verification
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              disabled={!photo}
              onClick={mergeAndSave}
              className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Complete Verification
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-8 bg-slate-100 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 bg-slate-100 text-slate-900 rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Clear Profile</h3>
            <p className="text-xs text-slate-500">Ensure your face is well-lit and centered in the frame.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 bg-slate-100 text-slate-900 rounded-lg flex items-center justify-center mb-4">
              <PenTool className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Digital Signature</h3>
            <p className="text-xs text-slate-500">Draw your signature directly over the captured photo.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 bg-slate-100 text-slate-900 rounded-lg flex items-center justify-center mb-4">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Blob Merge</h3>
            <p className="text-xs text-slate-500">Both elements will be merged into a single secure audit file.</p>
          </div>

        </div>
      </main>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

export default Details;
