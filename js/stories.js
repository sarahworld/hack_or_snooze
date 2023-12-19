"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const showStar = Boolean(currentUser);
  return $(`
      <li id="${story.storyId}">
      ${showDeleteBtn ? getDeleteBtnHtml() : ""}
      ${showStar ? getStarHTML(story,currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function getDeleteBtnHtml() {
  return `
    <span class="trash-can">
    <i class="fa-regular fa-trash-can id="remove""></i>
    </span>
  `
}

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const $starType = isFavorite ? "solid" : "regular"
  return `
  <span class="star">
  <i class="fa-${$starType} fa-star"></i>
  </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function addStoryToStories(){

  const allStories = new StoryList(storyList);

  const author = $("#author").val();
  const title = $("#story-title").val();
  const url = $("#story-url").val();
 
  const newStory = await allStories.addStory(currentUser,{title, author, url});
 
  putStoriesOnPage();
}

$("#story-submit-form").on("submit", addStoryToStories);

function putFavouriteListonPage() {
  $favouritedList.empty();

  if(currentUser.favorites.length === 0){
    $favouritedList.append("<h5>NO FAVOURITES</h5>")
  }
  else {
    for(let story of currentUser.favorites){
      const $story = generateStoryMarkup(story);
      $favouritedList.append($story);
    }
  }
  $favouritedList.show()
}

async function toggleStarIcon(evt) {
  
 
  const $target = $(evt.target);
  const $nearbyLi = $target.closest('li');
  const storyId = $nearbyLi.attr("id");
  const story = storyList.stories.find(s => (s.storyId === storyId));
  console.log($target);

  // see if item is already favorited
  if($target.hasClass("fa-solid")){
    await currentUser.removeFavorite(story);
    $target.closest("i").toggleClass("fa-solid fa-regular");
  }
  else {
    console.log("in else")
    await currentUser.addFavorite(story);
    $target.closest("i").toggleClass("fa-solid fa-regular");
  }
}
$allStoriesList.on("click", ".star", toggleStarIcon);

function putOwnStoriesListOnPage() {
  console.log("MY STORIES");
  $ownStories.empty();

  if(currentUser.ownStories.length === 0){
    $ownStories.append("<h5>No Own Stories</h5>");
  }
  else {
    for(let ownStory of currentUser.ownStories){
      const $ownStory = generateStoryMarkup(ownStory, true);
      $ownStories.append($ownStory);
    }
  }

  $ownStories.show();

}

async function deleteStory(evt) {
  const $target = $(evt.target);
  const $closestLi = $target.closest("li").attr("id");
  const $removeStory = storyList.stories.find(s => (s.storyId === $closestLi));

  await storyList.removeStory(currentUser, $closestLi);

  await putOwnStoriesListOnPage();
  
}


$ownStories.on("click", ".trash-can", deleteStory)

