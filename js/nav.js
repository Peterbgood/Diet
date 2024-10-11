const nav = document.querySelector(".nav-container");
nav.innerHTML = `
  <nav class="navbar bg-light">
    <div class="container-fluid">
       <ul class="navbar-nav justify-content-center">
        <li class="nav-item"> <a class="nav-link" href="cal.html"><i class="fa-solid fa-utensils"></i></a></li>
        <li class="nav-item"> <a class="nav-link" href="week.html"><i class="fa-solid fa-chart-column"></i></a></li>
        <li class="nav-item"> <a class="nav-link" href="yearly.html"><i class="fa-solid fa-trophy"></i></a></li>
        <li class="nav-item"> <a class="nav-link" href="weight.html"><i class="fa fa-weight"></i></a></li>
		<!--<li class="nav-item"> <a class="nav-link" href="Boosters.html"><i class="fa fa-rocket"></i></a></li>-->
       
      
      </ul>
    </div>
  </nav>
`;
