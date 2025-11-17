import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home(){
  const { me } = useAuth();
  return (
    <main>
      {/* Section 1 - Hero */}
      <section className="discovery container section-1">
        <div className="row align-items-center">
          <div className="text col-lg-6 col-md-6 col-12 d-flex flex-column align-items-center align-items-lg-start justify-content-center text-center text-lg-left">
            <h1 className="pinpoint-heading mb-3">PINPOINT</h1>
            <p>Something lost it's way and came to you just to show the world how honest you are!</p>
            <p className="mb-5">Or if you've lost something just chill! People here are damnnn cool!</p>
            <div className="shrink align-self-center align-self-lg-start">
              <a id="ctaMain" className="learn-more" href={me ? '/app/home' : '/register'}>{me ? 'Dive In' : 'Register Now'}</a>
            </div>
          </div>
          <div className="img col-lg-6 col-md-6 col-12 pt-5 pb-5">
            <img src="/images/lost-and-found.png" alt="image" className="img-fluid lost-found" />
          </div>
        </div>
      </section>

      {/* Section 2 - What we do */}
      <section className="discovery-col-ak section-2">
        <div className="container">
          <div className="row align-items-center">
            <div className="img col-lg-6 col-md-6 col-12 pt-5 pb-5">
              <img src="/images/community.png" alt="image" className="img-fluid border-top-20" />
            </div>
            <div className="text col-lg-6 col-md-6 col-12 pt-5 pb-5">
              <h2 className="title mb-3">WHAT WE DO<hr/></h2>
              <p className="mb-5">
                We try to reduce students stress somewhat by heping them if they lost something precious on the college/hostle grounds. <br/>
                There are two sections in the app — <b>LOST</b> and <b>FOUND</b>. Please <a href="/register">login</a> or <a href="/register">register</a> to access them. You can inform other people about what precious belonging you’ve lost and ask your fellow students for help and if you’ve found something then you can be of help to somebody else. Both the sections have their respective instructions. <br/>
                And the faculty involvement in this procedure is about nill, so it also helps in creating a strong bond between the kids and also to maintain transparency.
              </p>
              <div className="shrink d-inline-block">
                <a className="learn-more px-5" href="/about">Learn More</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - Services (Lost/Found) */}
      <section className="service section-3">
        <div className="col mx-auto align-items-center pt-5">
          <div className="heading text-center mb-5 pt-3">
            <h2 className="heading">OUR SERVICES<div className="d-flex justify-content-center"><hr/></div></h2>
          </div>
          <div className="container">
            <div className="row align-items-center">
              <div className="card-image col-lg-6 col-md-6 col-12 order-lg-1">
                <img className="img-fluid w-100" src="/images/lost-card.png" alt="Lost" />
              </div>
              <div className="one col-lg-6 col-md-6 col-12 order-lg-2 align-items-center lost-found-card">
                <h5 className="card-title">Lost</h5>
                <ul className="my-3">
                  <li className="text-left mb-3">Only the property lost on College or Hostel can be reported.</li>
                  <li className="text-left mb-3">Maximum time for filing any lost report should be 2 days.</li>
                  <li className="text-left mb-3">Try to be as much detailed as you can be.</li>
                  <li className="text-left mb-5">Head towards the form below if you have lost your property.</li>
                </ul>
                <div className="shrink">
                  <a className="learn-more px-5" href="/register">Login to proceed</a>
                </div>
              </div>
            </div>
          </div>
          <div className="container mt-5 pb-5">
            <div className="row align-items-center">
              <div className="card-image col-lg-6 col-md-6 col-12 order-lg-2">
                <img className="img-fluid w-100" src="/images/found-card.png" alt="Found" />
              </div>
              <div className="one col-lg-6 col-md-6 col-12 order-lg-1 align-items-center lost-found-card">
                <h5 className="card-title">Found</h5>
                <ul className="my-3">
                  <li className="text-left mb-3">Below is the form, if you've found a lost property on college/hostel.</li>
                  <li className="text-left mb-3">Please try to report as soon as possible so that you can help someone in need.</li>
                  <li className="text-left mb-3">The involvement of faculty will be kept as minimum as possible by our side, so that this might also help in student's ability to build connections.</li>
                  <li className="text-left mb-5">If nobody comes forward for the property you found, only then the faculty will get involved.</li>
                </ul>
                <div className="shrink">
                  <a className="learn-more px-5" href="/register">Login to proceed</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 - Mission */}
      <section className="service section-5">
        <div className="row align-items-center container mx-auto py-5">
          <div className="img col-lg-6 col-md-6 col-12">
            <img src="/images/mission.png" alt="image" className="img-fluid" />
          </div>
          <div className="text col-lg-6 col-md-6 col-12">
            <h2 className="title mb-3">OUR MISSION<hr/></h2>
            <p className="mb-5">
              Our mission is to make the students community more trustworthy and faithful and this place a safe space for all of your precious belongings. <br/>
              We all know the students have to bring many sorts of precious belongings to college for many reasons and there are many chances of loosing it which might give the students some permanent scars because who knows what insane amount of value a little thing might hold in a person’s life but don’t worry that’s where our page and your fellow collegemates come forward to help you ! We don’t want you to be stressed if you’ve lost something on the college and hostel grounds we just want you to fill the form under the <b><a href="/forms/lostForm.html">LOST</a></b> section so that we can get you out of this stress ASAP. <br/>
              Even this page is created and managed by some of the students, so your fellow collegemates have already started helping you in a way.
            </p>
            <div className="shrink d-inline-block">
              <a className="learn-more" href="/about">Learn More</a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 - Testimonials */}
      <section className="section-primary t-bordered section-6">
        <div className="heading text-center mb-4">
          <h2 className="heading">TESTIMONIALS<div className="d-flex justify-content-center"><hr/></div></h2>
        </div>
        <div className="container pb-5">
          <div className="row testimonial-three testimonial-three--col-three">
            <div className="col-md-4 testimonial-three-col">
              <div className="testimonial-inner">
                <div className="testimonial-image" itemProp="image">
                  <img width="180" height="180" src="https://bootdey.com/img/Content/avatar/avatar1.png" />
                </div>
                <div className="testimonial-meta mb-2">
                  <strong className="testimonial-name" itemProp="name">Rawat Senpai</strong>
                </div>
                <div className="testimonial-content">
                  <p>Not gonna lie friends, it really worked for me, I lost my watch and was abe to retrieve it within a week. And the relief i got after that was just immense. Can’t thank you guys enough.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 testimonial-three-col">
              <div className="testimonial-inner">
                <div className="testimonial-image" itemProp="image">
                  <img width="180" height="180" src="https://bootdey.com/img/Content/avatar/avatar2.png" />
                </div>
                <div className="testimonial-meta mb-2">
                  <strong className="testimonial-name" itemProp="name">Ishan Mishra</strong>
                </div>
                <div className="testimonial-content">
                  <p>Here to share this wonderful experience when i lost my book and luckily a senior from the course same as mine returned it to me and they also help me with my acedemics very often now. Thanks a lot fot this.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 testimonial-three-col">
              <div className="testimonial-inner">
                <div className="testimonial-image" itemProp="image">
                  <img width="180" height="180" src="https://bootdey.com/img/Content/avatar/avatar6.png" />
                </div>
                <div className="testimonial-meta mb-2">
                  <strong className="testimonial-name" itemProp="name">Srishti Shukla</strong>
                </div>
                <div className="testimonial-content">
                  <p>At first i didn’t put so much faith in this, but later when I got back my Headphone I can’t express how good I felt. And I never imagined that i’ll get it back but i was wrong and i got it back. And i never knew that my collegemates were so good and helpful. Thanks guys it means a lot.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
