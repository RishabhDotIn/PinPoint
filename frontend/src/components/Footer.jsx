import React from 'react';

export default function Footer(){
  return (
    <footer id="page-footer" className="py-2 bg-dark">
      <div className="brand">
        <a className="navbar-brand" href="#">PinPoint</a>
      </div>
      <div className="copyright">
        <small>
          <span>Copyright &copy;</span> <span>All Rights Reserved</span>
          <span>Terms of Use</span> and <span>Privacy Policy</span>
        </small>
      </div>
      <br />
      <hr />
      <div className="favicon">
        <i className="social-media fab fa-facebook-f fa-2x"></i>
        <i className="social-media fab fa-twitter fa-2x"></i>
        <i className="social-media fab fa-instagram fa-2x"></i>
        <i className="social-media fas fa-envelope fa-2x"></i>
      </div>
      <div className="BackToTop">
        <a id="back-to-top" href="#" role="button"><i className="back fas fa-chevron-up fa-2x"></i></a>
        <h4>Back To Top</h4>
      </div>
    </footer>
  );
}
