const React = require('react');

module.exports = ({ src, alt, ...props }) => {
  // Render a simple img for tests
  return React.createElement('img', { src, alt, ...props });
};
