import React from 'react';

export default function About(){
  return (
    <div className="container aboutus">
      {/* Hero */}
      <section className="py-4 text-center">
        <h1 className="display-4 text-dark mb-3">About PinPoint</h1>
        <p className="lead text-dark mb-0">A simple way for our campus community to reunite lost items with their rightful owners.</p>
      </section>

      {/* Mission & How it works */}
      <section className="row">
        <div className="col-md-6 mb-4">
          <div className="h-100 p-4 aboutus-card">
            <h3 className="text-dark mb-3">Our Mission</h3>
            <p className="mb-0">We’re building a trustworthy, student-driven network that minimizes loss on campus and makes returning items easy and rewarding.</p>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="h-100 p-4 aboutus-card">
            <h3 className="text-dark mb-3">How It Works</h3>
            <ol className="mb-0">
              <li>Report a lost or found item.</li>
              <li>We match and notify relevant reports.</li>
              <li>Meet up, verify ownership, and close the loop.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="row">
        <div className="col-md-4 mb-4">
          <div className="h-100 p-4 aboutus-card text-center">
            <i className="fas fa-users fa-2x mb-3 pp-accent"></i>
            <h5 className="text-dark">Community</h5>
            <p className="mb-0">We help each other and celebrate honesty.</p>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="h-100 p-4 aboutus-card text-center">
            <i className="fas fa-shield-alt fa-2x mb-3 pp-accent"></i>
            <h5 className="text-dark">Trust</h5>
            <p className="mb-0">Accountable process and transparent records.</p>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="h-100 p-4 aboutus-card text-center">
            <i className="fas fa-hands-helping fa-2x mb-3 pp-accent"></i>
            <h5 className="text-dark">Impact</h5>
            <p className="mb-0">Reduce loss and stress; create happy college memories.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-4">
        <a className="learn-more mr-2" href="/index.html">Go to Home</a>
        <a className="learn-more" href="/forms/register.html"><i className="fas fa-user mr-1"></i> Login</a>
      </section>
    </div>
  );
}
