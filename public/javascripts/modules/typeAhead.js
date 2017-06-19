import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHtml(stores)
{
	return stores.map(store=>{ return `<a href='/store/${store.slug}' class='search__result'>${store.name}</a>`}).join('');
}



function typeAhead(search)
{
	if(!search) return;

	const searchInput = search.querySelector('input[name="search"]');
	const searchResult = search.querySelector('.search__results');

	searchInput.on('input', function(){
		//if there is no value hide search results..
		if(!this.value)
		{
			searchResult.style.display = "none";
			return;
		}
		//show the search results..
		searchResult.style.display = 'block';
		axios
		.get(`/api/search?q=${this.value}`)
		.then(res=>
			{
				if(res.data.length)
				{
					searchResult.innerHTML = dompurify.sanitize(searchResultsHtml(res.data));
					return;
				}
				searchResult.innerHTML = dompurify.sanitize(`<div class='search__result'>No Results found for ${this.value}</div>`);
			}).catch(err=> { console.Error(err);});
	});

	searchInput.on('keyup',(e)=>{
		//console.log(e.keyCode);
		if(![38,40,13].includes(e.keyCode))
		{
			return;
		}

		const activeClass = "search__result--active";
		const current = searchResult.querySelector(`.${activeClass}`);
		const items = searchResult.querySelectorAll('.search__result');
		let next;
		//console.log(items);
		if(e.keyCode === 40 && current)
		{
			next = current.nextElementSibling || items[0];
			next.classList.add(activeClass);
		}
		else if(e.keyCode === 40)
		{
			next = items[0];
			next.classList.add(activeClass);
		}
		else if(e.keyCode === 38 && current )
		{
			next = current.previousElementSibling || items[items.length-1];
			next.classList.add(activeClass);
		}
		else if(e.keyCode === 38)
		{
			next = items[items.length-1];
			next.classList.add(activeClass);
		}
		else if(e.keyCode === 13 && current)
		{
			window.location = current.href;
		}
		if(current)
		{
			current.classList.remove(activeClass);
		}
		
	})
};

export default typeAhead;