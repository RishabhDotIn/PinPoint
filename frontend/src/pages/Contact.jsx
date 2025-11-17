import React, { useEffect } from 'react';

export default function Contact(){
  useEffect(() => {
    const form = document.getElementById('contactForm');
    const alertBox = document.getElementById('formAlert');
    if (!form) return;
    function onSubmit(e){
      e.preventDefault();
      if (!alertBox) return;
      alertBox.className = 'alert alert-info';
      alertBox.textContent = 'Sending...';
      alertBox.classList.remove('d-none');
      (async () => {
        try{
          const formData = new FormData(form);
          const res = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept':'application/json' }
          });
          const data = await res.json().catch(()=>({}));
          if (res.ok){
            alertBox.className = 'alert alert-success';
            alertBox.textContent = 'Message sent successfully! We will reply soon.';
            form.reset();
          } else {
            const msg = (data && data.message) ? data.message : 'Something went wrong. Please try again later.';
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = msg;
          }
        }catch(err){
          alertBox.className = 'alert alert-danger';
          alertBox.textContent = 'Network error. Please check your connection and try again.';
        }
      })();
    }
    form.addEventListener('submit', onSubmit);
    return () => form.removeEventListener('submit', onSubmit);
  }, []);

  return (
    <div className="auth-page">
      <header>
        <div className="heading text-center" style={{marginTop:'2rem'}}>
          <h1 className="font-weight-bold text-dark">CONTACT US</h1>
        </div>
        <section className="discovery py-5">
          <div className="row align-items-center container mx-auto">
            <div className="img col-lg-6 col-md-6 col-12 d-none d-md-block">
              <img src="/images/contactus.jpg" alt="image" className="img-fluid" />
            </div>
            <div className="text col-lg-6 col-md-6 col-12">
              <div className="auth-card mt-4" id="form-container">
                <h2 className="mb-2">We'd love to hear from you</h2>
                <div className="auth-help">Fill the form and we'll get back within 1–2 business days.</div>
                <div id="formAlert" className="alert alert-success d-none" role="alert" aria-live="polite"></div>
                <form id="contactForm" action="https://api.web3forms.com/submit" method="POST">
                  <input type="hidden" name="access_key" value="84773365-fbe2-45f9-a602-975e98ab43ca" />
                  <input type="hidden" name="from_name" value="PinPoint Website" />
                  <input type="text" name="botcheck" className="d-none" tabIndex="-1" autoComplete="off" aria-hidden="true" />
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input type="text" name="name" placeholder="Your name" className="form-control" id="name" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" name="email" placeholder="john@gmail.com" className="form-control" id="email" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone No.</label>
                    <input id="phone" type="text" name="phone[1][number]" className="form-control" placeholder="+91 8888 8888" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input id="subject" name="subject" type="text" className="form-control" placeholder="Subject" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea name="message" className="form-control" id="message" placeholder="Write your message..." rows={6}></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block mt-2">Submit</button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </header>
    </div>
  );
}
