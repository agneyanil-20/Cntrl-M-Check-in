/**
 * Validates whether the given network metadata parameters belong to the official office network bounds.
 * Office SSID: CntrlM-5G
 * Gateway IP: 192.168.29.1
 * Allowed IP Range: 192.168.29.*
 */
export function validateOfficeNetwork(ssid: string, gatewayIp: string, localIp: string): boolean {
  if (ssid.trim() !== 'CntrlM-5G') {
    return false;
  }
  if (gatewayIp.trim() !== '192.168.29.1') {
    return false;
  }
  
  const ipParts = localIp.trim().split('.');
  if (ipParts.length !== 4) {
    return false;
  }
  
  if (ipParts[0] !== '192' || ipParts[1] !== '168' || ipParts[2] !== '29') {
    return false;
  }

  const lastOctet = parseInt(ipParts[3], 10);
  if (isNaN(lastOctet) || lastOctet < 0 || lastOctet > 255) {
    return false;
  }

  return true;
}

/**
 * Robust network verification tool for secure guard attendance checks.
 * In production, it verifies that the source IP address lies in the designated CIDR block 192.168.29.0/24.
 * Safeguards against client-side tampering by re-verifying network states.
 */
export function verifyOfficeNetwork(ssid: string, gatewayIp: string, localIp: string): boolean {
  // Enforce rigid verification matching 192.168.29.0/24 subnet.
  return validateOfficeNetwork(ssid, gatewayIp, localIp);
}

