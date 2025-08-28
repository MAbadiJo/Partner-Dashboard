import jsQR from 'jsqr';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const QRScannerPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        navigate('/partner/login');
        return;
      }

      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select('*')
        .eq('id', user.id)
        .single();

      if (partnerError || !partnerData) {
        navigate('/partner/login');
        return;
      }

      setLoading(false);
      startScanner();
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/partner/login');
    }
  };

  const startScanner = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setScanning(true);
      scanQRCode();
    } catch (error) {
      console.error('Error starting scanner:', error);
      setError('Failed to access camera. Please check permissions.');
    }
  };

  const scanQRCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const scanFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          handleScannedCode(code.data);
          return;
        }
      }

      if (scanning) {
        requestAnimationFrame(scanFrame);
      }
    };

    scanFrame();
  };

  const handleScannedCode = async (code) => {
    setScannedCode(code);
    setScanning(false);

    try {
      // Validate the ticket
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('ticket_code', code)
        .single();

      if (error || !ticket) {
        setScanResult({
          valid: false,
          message: 'Invalid ticket code',
          ticket: null
        });
        return;
      }

      // Check if ticket belongs to this partner
      const partnerInfo = JSON.parse(localStorage.getItem('partnerInfo'));
      if (ticket.partner_id !== partnerInfo?.id) {
        setScanResult({
          valid: false,
          message: 'This ticket does not belong to your business',
          ticket: null
        });
        return;
      }

      // Check ticket status
      if (ticket.status === 'used') {
        setScanResult({
          valid: false,
          message: 'Ticket has already been used',
          ticket: ticket
        });
        return;
      }

      if (ticket.status === 'expired') {
        setScanResult({
          valid: false,
          message: 'Ticket has expired',
          ticket: ticket
        });
        return;
      }

      if (ticket.status === 'cancelled') {
        setScanResult({
          valid: false,
          message: 'Ticket has been cancelled',
          ticket: ticket
        });
        return;
      }

      // Check if ticket is still valid
      const now = new Date();
      const validUntil = new Date(ticket.valid_until);
      
      if (now > validUntil) {
        setScanResult({
          valid: false,
          message: 'Ticket has expired',
          ticket: ticket
        });
        return;
      }

      setScanResult({
        valid: true,
        message: 'Ticket is valid',
        ticket: ticket
      });

    } catch (error) {
      console.error('Error validating ticket:', error);
      setScanResult({
        valid: false,
        message: 'Error validating ticket',
        ticket: null
      });
    }
  };

  const markTicketAsUsed = async () => {
    if (!scanResult?.ticket) return;

    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'used',
          used_at: new Date().toISOString(),
          used_by: JSON.parse(localStorage.getItem('partnerInfo'))?.name || 'Unknown'
        })
        .eq('id', scanResult.ticket.id);

      if (error) {
        setError('Failed to mark ticket as used');
        return;
      }

      // Log the scanning
      await supabase
        .from('scanning_logs')
        .insert({
          partner_id: JSON.parse(localStorage.getItem('partnerInfo'))?.id,
          ticket_id: scanResult.ticket.id,
          scanned_by: JSON.parse(localStorage.getItem('partnerInfo'))?.name || 'Unknown',
          scan_result: 'valid',
          scan_location: 'QR Scanner',
          device_info: navigator.userAgent,
          ip_address: '192.168.1.100' // In real app, get from server
        });

      setScanResult({
        ...scanResult,
        ticket: { ...scanResult.ticket, status: 'used' }
      });

    } catch (error) {
      console.error('Error marking ticket as used:', error);
      setError('Failed to mark ticket as used');
    }
  };

  const resetScanner = () => {
    setScannedCode('');
    setScanResult(null);
    setError(null);
    setScanning(true);
    scanQRCode();
  };

  const stopScanner = () => {
    setScanning(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scanner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-12 pb-24">
      <div className="px-4 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => navigate('/partner/home')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">QR Code Scanner</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
          <p className="text-gray-600">Scan customer tickets to validate them</p>
        </div>

        {/* Scanner Interface */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {!scanResult ? (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full max-w-md mx-auto rounded-lg border-2 border-purple-500"
                  autoPlay
                  muted
                  playsInline
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                <div className="absolute inset-0 max-w-md mx-auto flex items-center justify-center">
                  <div className="border-2 border-white rounded-lg w-64 h-64">
                    <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-purple-500"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-purple-500"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-purple-500"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-purple-500"></div>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Position the QR code within the frame to scan
                </p>
                <button
                  onClick={stopScanner}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Stop Scanner
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  scanResult.valid ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {scanResult.valid ? (
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                
                <h3 className={`text-lg font-semibold mb-2 ${
                  scanResult.valid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {scanResult.message}
                </h3>

                {scanResult.ticket && (
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold mb-2">Ticket Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Code:</span> {scanResult.ticket.ticket_code}</div>
                      <div><span className="font-medium">Customer:</span> {scanResult.ticket.customer_name}</div>
                      <div><span className="font-medium">Amount:</span> {scanResult.ticket.total_amount} JOD</div>
                      <div><span className="font-medium">Status:</span> {scanResult.ticket.status}</div>
                      <div><span className="font-medium">Valid Until:</span> {new Date(scanResult.ticket.valid_until).toLocaleString()}</div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4 mt-6">
                  {scanResult.valid && scanResult.ticket?.status === 'active' && (
                    <button
                      onClick={markTicketAsUsed}
                      className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                    >
                      Mark as Used
                    </button>
                  )}
                  <button
                    onClick={resetScanner}
                    className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
                  >
                    Scan Another
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Manual Entry */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Manual Ticket Entry</h3>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Enter ticket code manually..."
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={() => handleScannedCode(scannedCode)}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
            >
              Validate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerPage; 