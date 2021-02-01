/*
  Import the ip-cidr npm package.
  See https://www.npmjs.com/package/ip-cidr
  The ip-cidr package exports a class.
  Assign the class definition to variable IPCIDR.
*/
const IPCIDR = require('ip-cidr');



/**
 * Calculates an IPv4-mapped IPv6 address.
 * @param {string} ipv4 - An IPv4 address in dotted-quad format.
 * @return {*} (ipv6Address) - An IPv6 address string or null if a run-time problem was detected.
 */
function getIpv4MappedIpv6Address(ipv4) {

  // Initialize return argument
  let ipv6Address = null;

  // Prepare to derive a Hex version of the dotted-quad decimal IPv4 address.
  // Split the IPv4 address into its four parts.
  let ipv4Quads = ipv4.split('.');
  // Count the number of parts found.
  let numIpv4Segments = ipv4Quads.length;

  // Verify IPv4 had four parts.
  if (numIpv4Segments === 4) {
    let validQuads = true;
    // Iterate over the IPv4 address parts and verify each segment was a number between 0 and 255.
    for(let i=0; i < numIpv4Segments; i++) {
      if( isNaN(Number(ipv4Quads[i])) || ipv4Quads[i] < 0 || ipv4Quads[i] > 255 ) {
        validQuads = false;
      }
    }
    // Passed IPv4 is valid. Now to derive an IPv4-mapped IPv6 address.
    if (validQuads) {
      // Hardcode the prefix. During refactor, we might want to make the prefix a const.
      ipv6Address = "0:0:0:0:0:ffff:";
      // Iterate over the IPv4 parts
      for(let i=0; i < numIpv4Segments; i++) {
        // Convert part to an integer, then convert to a hex string using method toString()
        // with a base 16 (hex) encoding.
        let hexString = parseInt(ipv4Quads[i]).toString(16);
        // If hex is odd (single digit), prepend a '0'. This is why we wanted to work with a string.
        if (hexString.length % 2)
          hexString = '0' + hexString;
        // Append hex part to evolving variable ipv6Address.
        ipv6Address = ipv6Address + hexString;
        // Add a colon to split the encoded address and match the IPv6 format.
        if(i===1) {
          ipv6Address = ipv6Address + ':';
        }
      }
    }
  }
  return ipv6Address;
}




class IpAddress {
  constructor() {
    // IAP's global log object is used to output errors, warnings, and other
    // information to the console, IAP's log files, or a Syslog server.
    // For more information, consult the Log Class guide on the Itential
    // Developer Hub https://developer.itential.io/ located
    // under Documentation -> Developer Guides -> Log Class Guide
    //log.info('Starting the IpAddress product.');
  }
  /**
 * Calculate and return the first host IP address from a CIDR subnet.
 * @param {string} cidrStr - The IPv4 subnet expressed
 *                 in CIDR format.
 * @param {callback} callback - A callback function.
 * @return {string} (firstIpAddress) - An IPv4 address.
 */
getFirstIpAddress(cidrStr, callback) {

  // Initialize return arguments for callback
  let firstIpAddress = {
      ipv4: null,
      ipv6: null
  }

  let callbackError = null;

  // Instantiate an object from the imported class and assign the instance to variable cidr.
  const cidr = new IPCIDR(cidrStr);
  // Initialize options for the toArray() method.
  // We want an offset of one and a limit of one.
  // This returns an array with a single element, the first host address from the subnet.
  const options = {
    from: 1,
    limit: 1
  };

  // Use the object's isValid() method to verify the passed CIDR.
  if (!cidr.isValid()) {
    // If the passed CIDR is invalid, set an error message.
    callbackError = 'Error: Invalid CIDR passed to getFirstIpAddress.';
  } else {
    // If the passed CIDR is valid, call the object's toArray() method.
    // Notice the destructering assignment syntax to get the value of the first array's element.
    [firstIpAddress.ipv4] = cidr.toArray(options);
    firstIpAddress.ipv6 = getIpv4MappedIpv6Address(firstIpAddress.ipv4);
  }

  return callback(firstIpAddress, callbackError);
}
}

module.exports = new IpAddress;