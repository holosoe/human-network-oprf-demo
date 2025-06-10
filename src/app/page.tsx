'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { requestFromSigner, base64Encode, checkAndDeriveHumanKey } from '@/lib/humanNetwork';
import QRCode from 'qrcode';

interface DerivedResult {
  privateKey: string;
  publicKey: string;
  address: string;
}

interface PulseRecord {
  e_0: string;
  e_1: string;
  e_2: string;
  e_3: string;
  e_4: string;
  e_5: string;
  e_6: string;
  e_7: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [derivedResult, setDerivedResult] = useState<DerivedResult | null>(null);
  const [error, setError] = useState<string>('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
  // Sample data for demonstration
  const [record, setRecord] = useState<PulseRecord>({
    e_0: '0.4571292698',
    e_1: '0.5353872776',
    e_2: '0.5696328282',
    e_3: '0.2271608561',
    e_4: '0.2271608561',
    e_5: '0.1370210052',
    e_6: '0.921902895',
    e_7: '0.2847377956',
  });

  const [config, setConfig] = useState({
    signerUrl: 'http://localhost:3030'
  });

  const requestOPRFSecp256k1 = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const hashedPulseRecord = await base64Encode(JSON.stringify(record));

      console.log("hashedPulseRecord", hashedPulseRecord);
      
      // request Human Network for OPRFSecp256k1 via signer
      const result = await requestFromSigner({
        value: hashedPulseRecord,
        method: 'OPRFSecp256k1',
        signerUrl: config.signerUrl
      });

      console.log("result from Human Network", result);

      const derivedResult = await checkAndDeriveHumanKey(result);

      if('error' in derivedResult) {
        setError(derivedResult.error as string);
        return;
      }

      console.log("derivedResult", derivedResult);

      setDerivedResult(derivedResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [config, record]);

  // Generate QR code when derivedResult changes
  useEffect(() => {
    if (derivedResult?.address) {
      QRCode.toDataURL(derivedResult.address)
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('QR code generation failed:', err));
    }
  }, [derivedResult]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Human Network OPRF demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Demonstration of deriving Human Key from Pulse Data using Human Network&apos;s OPRF.
          </p>
        </div>

        <div className="grid lg:grid-cols-1 gap-8 mb-8">
          {/* Configuration Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Configuration</h2>
            
            <div className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signer URL
                </label>
                <input
                  type="text"
                  value={config.signerUrl}
                  onChange={(e) => setConfig({...config, signerUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="http://localhost:3030"
                />
                <p className="text-sm text-gray-600 mt-2">
                  For quick testing, request for a demo signer URL. <a href="https://docs.network.human.tech/for-developers/making-requests-to-human-network/signer-on-behalf-of-users" target="_blank" rel="noopener noreferrer">Or deploy one your own by referring to docs</a>.
                </p>
              </div>
              
            </div>
          </div>

          {/* Pulse Data Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Pulse Data</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  e_0
                </label>
                <input
                  type="text"
                  value={record.e_0}
                  onChange={(e) => setRecord({...record, e_0: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  e_1
                </label>
                <input
                  type="text"
                  value={record.e_1}
                  onChange={(e) => setRecord({...record, e_1: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  e_2
                </label>
                <input
                  type="text"
                  value={record.e_2}
                  onChange={(e) => setRecord({...record, e_2: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  e_3
                </label>
                <input
                  type="text"
                  value={record.e_3}
                  onChange={(e) => setRecord({...record, e_3: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  e_4
                </label>
                <input
                  type="text"
                  value={record.e_4}
                  onChange={(e) => setRecord({...record, e_4: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  e_5
                </label>
                <input
                  type="text"
                  value={record.e_5}
                  onChange={(e) => setRecord({...record, e_5: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  e_6
                </label>
                <input
                  type="text"
                  value={record.e_6}
                  onChange={(e) => setRecord({...record, e_6: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  e_7
                </label>
                <input
                  type="text"
                  value={record.e_7}
                  onChange={(e) => setRecord({...record, e_7: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">          
          <button
            onClick={requestOPRFSecp256k1}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            {isLoading ? 'Requesting...' : 'Request OPRFSecp256k1'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {derivedResult && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Derived Human Key</h2>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Private Key</h3>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPrivateKey}
                      onChange={(e) => setShowPrivateKey(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Show</span>
                  </label>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <code className="text-sm text-gray-800 break-all font-mono">
                    {showPrivateKey ? derivedResult.privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                  </code>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Public Key</h3>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <code className="text-sm text-gray-800 break-all font-mono">
                    {derivedResult.publicKey}
                  </code>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Ethereum Address</h3>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <code className="text-sm text-gray-800 break-all font-mono">
                    {derivedResult.address}
                  </code>
                </div>
              </div>

              {qrCodeUrl && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Address QR Code</h3>
                  </div>
                  <div className="bg-gray-50 rounded p-3 flex justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt="Address QR Code" 
                      className="w-48 h-48 border rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Information Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">How It Works</h2>

          <div className="grid md:grid-cols-1 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Oblivious Pseudorandom Function (OPRF)</h3>
              <p className="text-gray-600 mb-4">
              An OPRF is a pseudorandom function with the following properties:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>- The parties compute: O = OPRF(I, S)</li>
                <li>- The first party (the client), knows the input (I) and learns the output (O) but does not learn the secret (S)</li>
                <li>- The second party (the server), knows the secret (S), but does not learn either the input (I), nor the output (O).</li>
                <li>- The function has the same security properties as any (cryptographically secure) pseudorandom function.</li>
                <li>- Specifically it shall be hard to distinguish the output from true randomness.</li>
              </ul>
            </div>
  
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">OPRF use cases</h3>
              <p className="text-gray-600 mb-4">
                OPRFs enable privacy-preserving applications across various domains where sensitive data processing is required:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>- Password-based key derivation (secure password storage)</li>
                <li>- Private set intersection (finding common elements without revealing data)</li>
                <li>- Privacy-preserving authentication systems</li>
                <li>- Anonymous credentials and digital identity</li>
                <li>- Private contact discovery in messaging apps</li>
                <li>- Zero-knowledge proof systems</li>
                <li>- Privacy-preserving analytics and machine learning</li>
                <li>- Anonymous voting and governance systems</li>
                <li>- Secure multi-party computation protocols</li>
                <li>- Private information retrieval from databases</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">About Human Network</h3>
              <p className="text-gray-600 mb-4">
              Human Network the network for Human keys. It is secured by Ethereum stake as an Actively Validated Service (AVS) on Eigenlayer and Symbiotic as part of the Human Tech suite built by Holonym Foundation.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>- Documentations: <a href="https://docs.network.human.tech/" target="_blank" rel="noopener noreferrer">https://docs.network.human.tech/</a></li>
                <li>- Blog: <a href="https://human.tech/blog/human-keys" target="_blank" rel="noopener noreferrer">https://human.tech/blog/human-keys</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
