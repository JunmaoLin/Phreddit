import Model from './model.js';
const model = new Model();

const communities = model.data.communities;
const posts = model.data.posts;
const comments = model.data.comments;
const linkFlairs = model.data.linkFlairs;
let postCounter = 0;

window.onload = function() {
  // fill me with relevant code
  document.getElementById("homePage").style.display = "block";
  //displayTime();
  showHomePage();
  //formatPost(posts, false);

  const goToHome = document.getElementsByClassName("goToHomePage");
  for(const x of goToHome){
    x.onclick = function(){
      showHomePage();
    }
  }

  document.getElementById("search_bar").addEventListener("keypress", function (event){
    if(event.keyCode == 13){
      let input = document.getElementById("search_bar").value.toLowerCase();
      document.getElementById("buttonSection").style.display = "inline-flex";
      ///console.log("THIS IS INPUT: " + input);
      search(input);

    }
  })

  //CREATE POST FORM
  document.getElementById("create_post_button").onclick = displayCreatePostForm;
  document.getElementById("closePostFormButton").onclick = closePostFormButton;
  document.getElementById("submitPostFormButton").onclick = submitCreatePostForm;

  //POPUP FORM FOR CREATING COMMUNITY
  document.getElementById("create_community_button").onclick = openCreateCommunityForm;
  document.getElementById("closeCommunityFormButton").onclick = closeCreateCommunityForm;
  document.getElementById("openCommunityFormButton").onclick = submitCreateCommunityForm;
  
  //Populate the communities on the nav bar
  populateCommunitiesOnNavBar();

};

function showHomePage(){
  hideMainContent();
  document.getElementById("homePage").style.display = "block";
  orderNewest();
  document.getElementById("header").innerHTML = `
        <header id="left-side">
          All Posts  
        </header>
  
        <div id="buttonSection">
          <button class="rightSide" id="newest">
            Newest
          </button>
  
          <button class="rightSide" id="oldest">
            Oldest
          </button>
          
          <button class="rightSide" id="active">
            Active
          </button>
        </div>`;
  document.getElementById("newest").onclick = function() {
    orderNewest();
  }
  document.getElementById("oldest").onclick = function() {
    orderOldest();
  }
  document.getElementById("active").onclick = function() {
    orderActive();
  }
}

function search(txtInput){
  const wordArray = txtInput.split(" ");
  console.log(wordArray);
  const newPosts = filterPosts("search", wordArray);

  document.getElementById("newest").onclick = function() {
    orderNewest("search", wordArray);
  };
 
  document.getElementById("oldest").onclick = function() {
      orderOldest("search", wordArray);
  };

  document.getElementById("active").onclick = function() {
    orderActive("search", wordArray);
  };

  formatPost(newPosts, "search");
  
  if(newPosts.size > 0){
    document.getElementById("left-side").innerHTML = 
    `
      Results for: ${txtInput}<br>
    `
  }
  else if(newPosts.size == 0){
    const noResults = document.createElement("img");
    noResults.setAttribute('id', 'noResults');
    noResults.setAttribute('src', 'images/no-search-result-icon.svg');
    noResults.setAttribute('height', '50%');
    noResults.setAttribute('width', '50%');
    document.getElementById("left-side").innerHTML = 
    `
      No Results for: ${txtInput}<br>
    `
    document.getElementById("buttonSection").style.display ="none";
    
    const postsContainer = document.getElementById("posts")
    
    console.log(postsContainer.childNodes);
    postsContainer.append(noResults); 
    console.log(postsContainer.childNodes);
  }
}

function filterPosts(page, comName){
  let filter = [...posts];
  if(page == "community"){
    filter = filter.filter(function(element){
      return getCommunity(element.postID) === comName;
    });
  }

  if(page == "search"){
    filter = new Set();
   
    for(let i = 0; i < comName.length; i++){
      for(let j = 0; j < posts.length; j++){ 
        let commentArray = getTotalComments(posts[j]);
        for(const x of commentArray){
          if(x.content.toLowerCase().includes(comName[i])){
            filter.add(posts[j]);
          }
        }
        //need to fix
        
        if(posts[j].title.toLowerCase().includes(comName[i])){
          filter.add(posts[j]);
        }
        else if(posts[j].content.toLowerCase().includes(comName[i])){
          filter.add(posts[j]);
        }
      }
    }
  }
  console.log(filter);
  return filter;
}

function communityPageView(comName){
  const community = communities.find(function(community){
    return community.name === comName;
  });
  const timestamp = findTime(community.startDate);
  const comPostCount = community.postIDs.length;
  document.getElementById("left-side").innerHTML = 
  ` <div class="comName">
    ${comName}
    </div>
    <div class="description">
    ${community.description}  
    </div>

    Created: 
    <div class="timeStamp">
    ${timestamp}
    </div>  
    
    <div class="postCount"> 
    Post Count: ${comPostCount}
    </div>
  `
  orderNewest("community", comName);
  //formatPost(filterPosts(comName), comName);

  document.getElementById("newest").onclick = function() {
    orderNewest("community", comName);
  };
 
  document.getElementById("oldest").onclick = function() {
      orderOldest("community", comName);
    };

  document.getElementById("active").onclick = function() {
    orderActive("community", comName);
  };
}

function postPageView(postName){
  const commentSection = document.getElementById("posts");
  commentSection.innerHTML = '';
  const post = posts.find(function(post){
    return post.title === postName;
  });

  //i have a function getPost
  const comName = getCommunity(post.postID);
  const timestamp = findTime(post.postedDate);
  const userName = post.postedBy;
  const title = post.title;
  //if statement here
  const linkFlair = getLinkFlair(post.linkFlairID);
  
  let linkFlairInput = 
  `
    <div class="linkFlair">
        ${linkFlair}
    </div>
  `;
  if(linkFlair === 'not FOUND'){
    linkFlairInput = ``;
  }

  const content = post.content;
  const viewCount = post.views;
  post.commentIDs.sort(function(a,b){
    console.log("in the sort");
    return(getComment(b).commentedDate - getComment(a).commentedDate)
  });
  console.log("IDS");
  console.log(post.commentIDs);
  const commentCount = getCommentNum(post);
  const commentArray = getTotalComments(post);
  // console.log("THIS IS COMMENT ARRAY");
  // console.log(commentArray);
  document.getElementById("left-side").innerHTML = 
  `
    <div class="postTitle">
      <div class="comName">${comName}</div> 
      <span>•</span> 
      <div class="timeStamp">${timestamp}</div>
    </div>
    <div class="postTitle">
      ${userName}
    </div>
    <div id="postInfo">
      <div class="comName">
        ${title}
      </div> 
      <br>
      ${linkFlairInput}
      <div class="content">
        ${content}
      </div>
    </div>
    <div class="counters">
    <img
          class="viewIcon"
          src="images/view.svg"
          height="20"
          width="20"
        />
    ${viewCount}
    <img
          src="images/comment.svg"
          height="17"
          width="17"
        />
    ${commentCount}
    </div>
    <button id="create_comment_button">Add a Comment</button>
    
  `
  createThread(postName, commentArray, 0.5);

  //FORM FOR submitting COMMENT
  document.getElementById("create_comment_button").onclick = openCommentPage;
  document.getElementById("closeCommentFormButton").onclick = closeCommentPage;
  document.getElementById("submitCommentFormButton").onclick = function() {
    console.log("CALLED THIS FUCNTION")
    createNewComment(postName, post.commentIDs, "comment");
  }
  // console.log("clicked on");
  // console.log(postName);
}

function openCommentPage(){
  hideMainContent();
  document.getElementById("comment_page").style.display = "block";
}

function closeCommentPage(){
  hideMainContent();
  document.getElementById("homePage").style.display = "block";
  document.getElementById("comment_text").value = '';
  document.getElementById("comment_creator_username").value = '';
}

function createNewComment(postTitle, parentCommentIDs, commentOrReply){
  let commentContent = document.getElementById("comment_text").value;
  let username = document.getElementById("comment_creator_username").value;
  let newCommentID = comments.length + 1;
  let isValid = true;
  if (commentContent === "") {
    document.getElementById("comment_text_error").textContent = "Comment description should be between 0 - 500 characters.";
    isValid = false;
  }
  else{
    document.getElementById("comment_text_error").textContent = "";
  }
  if (username === "") {
    document.getElementById("comment_creator_username_error").textContent = 'Username is required.';
    isValid = false;
  }
  else{
    document.getElementById("comment_creator_username_error").textContent = "";
  }
  if(!isValid){
    return;
  }
  const newComment = {
    commentID: 'comment' + newCommentID,
    content: commentContent,
    commentedBy: username,
    commentedDate: new Date(),
    commentIDs: [],
  };
  comments.push(newComment);

  parentCommentIDs.push(newComment.commentID);
  

  hideMainContent();
  document.getElementById("homePage").style.display = "block";
  // refresh so that new comment shows up
  postPageView(postTitle);
  //clear input data
  document.getElementById("comment_text").value = '';
  document.getElementById("comment_creator_username").value = '';
  alert("Comment created successfully!");
}

function createThread(postName, commentArray, margin){
  let marginMap = new Map();
  for(const x of commentArray){
    let spacing = marginMap[x.commentID] || margin;
    
    commentDisplay(postName, x, spacing + "rem");
    
    for(const y of x.commentIDs){
      marginMap[y] = (spacing)+(4);
    }
  }
}

function commentDisplay(postName, comment, margin){

  
  const commentSection = document.getElementById("posts");
  const userName = comment.commentedBy;
  const timeStamp = findTime(comment.commentedDate);
  const content = comment.content;
  const id = comment.commentID;
  
  const commentThread = document.createElement("div");
  commentThread.className = "comment";
  commentThread.style.marginLeft = margin;
  console.log(id);
  commentThread.innerHTML = 
  `
    <span class="comment_style">
      <div class="commentInfo">
        <div class="commentTitle">
          ${id}
          ${userName}
          <span>•</span>
          <div class="timeStamp">
          ${timeStamp}
          </div>
        </div>
      </div>
      <div class="commentContent">
        ${content}
      </div>
      <button data-commentUnder="${id}" data-post-name="${postName}" class="replyButton">Reply</button>
    </span>
  `;

  let replyButton = commentThread.getElementsByClassName("replyButton");
  for(let button of replyButton){
    button.onclick = function(){
      openReplyPage(postName, comment.commentIDs);
      document.getElementById("closeReplyFormButton").onclick = closeReplyPage;
      document.getElementById("submitReplyFormButton").onclick = function() {
        createNewReply(postName, "reply");
      }
    }
  }
  
  commentSection.append(commentThread);
}

let currentParentCommentIDs;
let currentPostName;

function openReplyPage(postName, parentCommentIDs){
  hideMainContent();
  document.getElementById("reply_page").style.display = "block";

  currentParentCommentIDs = parentCommentIDs;
  currentPostName = postName;
}

function closeReplyPage(){
  hideMainContent();
  document.getElementById("homePage").style.display = "block";
  document.getElementById(`reply_text`).value = '';
  document.getElementById(`reply_creator_username`).value = '';
}

function createNewReply(postTitle, id){
  let commentContent = document.getElementById(`reply_text`).value;
  let username = document.getElementById(`reply_creator_username`).value;
  let newCommentID = comments.length + 1;
  let isValid = true;
  if (commentContent === "") {
    document.getElementById(`reply_text_error`).textContent = "Comment description should be between 0 - 500 characters.";
    isValid = false;
  }
  else{
    document.getElementById(`reply_text_error`).textContent = "";
  }
  if (username === "") {
    document.getElementById(`reply_creator_username_error`).textContent = 'Username is required.';
    isValid = false;
  }
  else{
    document.getElementById(`reply_creator_username_error`).textContent = "";
  }
  if(!isValid){
    return;
  }
  const newComment = {
    commentID: 'comment' + newCommentID,
    content: commentContent,
    commentedBy: username,
    commentedDate: new Date(),
    commentIDs: [],
  };
  comments.push(newComment);
  currentParentCommentIDs.push(newComment.commentID);
  
  hideMainContent();
  document.getElementById("homePage").style.display = "block";
  postPageView(postTitle);
  //clear input data
  document.getElementById(`reply_text`).value = '';
  document.getElementById(`reply_creator_username`).value = '';
  alert("Comment created successfully!");
}

//Populate the communities on the nav bar
function populateCommunitiesOnNavBar(){
  const unorderedList = document.getElementById("listsOfCommunities");
  unorderedList.innerHTML = "";
  for(const x of communities){
    const divItem = document.createElement("div");
    divItem.className = "nav_bar_element";
    //Need to define a way to link the community to the community page
    divItem.innerHTML = `<a class="link" data-comName="${x.name}">${x.name}</a>`;
    unorderedList.append(divItem);
  }

  let comsList = document.getElementsByClassName("link");
  console.log(comsList.length);
  for(let i = 0; i < comsList.length; i++){
    comsList[i].onclick = function(event) {
      event.preventDefault();
      const comName = comsList[i].getAttribute("data-comName");
      document.getElementById("buttonSection").style.display = "inline-flex";
      communityPageView(comName);
    }
  };
}

function hideMainContent (){
  const mainContentDivs = document.getElementsByClassName("main_cont_divs");
  for(const div of mainContentDivs){
    div.style.display = "none";
  }
}

//Display the create post form through banner create post button
function displayCreatePostForm(){
  hideMainContent()
  document.getElementById("new_post_page_view").style.display = "block";
  document.getElementById("community_dropdown").innerHTML = `<option value="" disabled selected>Select Community</option>`;
  document.getElementById("link_flair_dropdown").innerHTML = `<option value="" selected>Select Link Flair</option>`;

  const communityDropdown = document.getElementById("community_dropdown");
  for (const x of communities) {
    const option = document.createElement("option");
    option.value = x.communityID;
    option.textContent = x.name;
    communityDropdown.append(option);
  }

  const linkFlairDropdown = document.getElementById("link_flair_dropdown");
  for (const x of linkFlairs) {
    const option = document.createElement("option");
    option.value = x.linkFlairID;
    option.textContent = x.content;
    linkFlairDropdown.append(option);
  }
  const option = document.createElement("option");
  option.value = "CREATE_NEW_LINK_FLAIR"; //'lf' + linkFlairs.length+1;
  option.textContent = "CREATE NEW LINK FLAIR";
  linkFlairDropdown.append(option);

  linkFlairDropdown.addEventListener('change', function() {
    if (linkFlairDropdown.value === "CREATE_NEW_LINK_FLAIR") {
      document.getElementById("link_flair_input").style.display = "block";
    } else {
      document.getElementById("link_flair_input").style.display = "none";
    }
  });
}
//Close the create post form
function closePostFormButton(){
  hideMainContent();
  document.getElementById("homePage").style.display = "block";
  //clear input data
  document.getElementById("post_title").value = '';
  document.getElementById("post_text").value = '';
  document.getElementById("content_creator_username").value = '';
}
//Submit the create post form
function submitCreatePostForm(){
  let postTitle = document.getElementById("post_title").value;
  let postContent = document.getElementById("post_text").value;
  let username = document.getElementById("content_creator_username").value;
  let communityID = document.getElementById("community_dropdown").value;
  let communityName = document.getElementById("community_dropdown").options[document.getElementById("community_dropdown").selectedIndex].text;
  let newPostID = communityID.slice(9)

  let isValid = true;
  if(communityID === ""){
    document.getElementById("community_dropdown_error").textContent = "Please select a community.";
    isValid = false;
  }
  else{
    document.getElementById("community_dropdown_error").textContent = "";
  }
  if (postTitle === "" || postTitle.length > 100) {
    document.getElementById("post_title_error").textContent = "Post title should be between 0 - 100 characters.";
    isValid = false;
  }
  else{
    document.getElementById("post_title_error").textContent = "";
  }
  if (postContent === "") {
    document.getElementById("post_text_error").textContent = "Post content cannot be empty.";
    isValid = false;
  }
  else{
    document.getElementById("post_text_error").textContent = "";
  }
  if (username === "") {
    document.getElementById("content_creator_username_error").textContent = 'Username is required.';
    isValid = false;
  }
  else{
    document.getElementById("content_creator_username_error").textContent = "";
  }
  if(document.getElementById("link_flair_dropdown").value === "CREATE_NEW_LINK_FLAIR" && document.getElementById("link_flair_input").value === ""){
    document.getElementById("link_flair_input_error").textContent = "Link Flair cannot be empty.";
  }
  else{
    document.getElementById("link_flair_input_error").textContent = "";
  }
  if(!isValid){
    return;
  }

  const newLinkFlair = {
    linkFlairID: document.getElementById("link_flair_dropdown").value,
    content: document.getElementById("link_flair_input").textContent, 
  }
  if(document.getElementById("link_flair_dropdown").value === "CREATE_NEW_LINK_FLAIR"){
    newLinkFlair.linkFlairID = 'lf' + (linkFlairs.length+1);
    newLinkFlair.content = document.getElementById("link_flair_input").value;
    linkFlairs.push(newLinkFlair);
  }

  const newPost = {
    postID: 'p' + newPostID,
    title: postTitle,
    content: postContent,
    linkFlairID: newLinkFlair.linkFlairID,
    postedBy: username,
    postedDate: new Date(),
    commentIDs: [],
    views: 0,
  };
  posts.push(newPost);

  hideMainContent();
  document.getElementById("homePage").style.display = "block";
  //communityPageView(communityName);
  orderNewest("community", communityName);
  //clear input data
  document.getElementById("post_title").value = '';
  document.getElementById("post_text").value = '';
  document.getElementById("content_creator_username").value = '';
  document.getElementById("link_flair_input").style.display = "none";
  document.getElementById("link_flair_input").value = '';
  alert("Post created successfully!");
}

function openCreateCommunityForm(){
  hideMainContent();
  document.getElementById("community_popupForm_div").style.display = "block";
}
function closeCreateCommunityForm(){
  hideMainContent();
  document.getElementById("homePage").style.display = "block";
  document.getElementById("community_name").value = '';
  document.getElementById("community_description").value = '';
  document.getElementById("creator_username").value = '';
}

function submitCreateCommunityForm(){
  let communityName = document.getElementById("community_name").value;
  let description = document.getElementById("community_description").value;
  let username = document.getElementById("creator_username").value;
  let isValid = true;
  if (communityName === "" || communityName.length > 100) {
    document.getElementById("community_name_error").textContent = "Community name should be between 0 - 100 characters.";
    //alert("Community name should be between 0 - 100 characters.");
    isValid = false;
  }
  else{
    document.getElementById("community_name_error").textContent = "";
  }
  if (description === "") {
    document.getElementById("community_description_error").textContent = "Description should be between 0 - 500 characters.";
    //alert("Community description cannot be empty.");
    isValid = false;
  }
  else{
    document.getElementById("community_description_error").textContent = "";
  }
  if (username === "") {
    document.getElementById("creator_username_error").textContent = 'Username is required.';
    //alert("Creator username cannot be empty.");
    isValid = false;
  }
  else{
    document.getElementById("creator_username_error").textContent = "";
  }
  if(!isValid){
    return;
  }
  const newCommunity = {
    communityID: 'community' + (communities.length+1),
    name: communityName,
    description: description,
    postIDs: ['p' + (communities.length+1)],
    startDate: new Date(),
    members: [username],
    memberCount: 1,
  };
  communities.push(newCommunity);
  populateCommunitiesOnNavBar();

  hideMainContent();
  document.getElementById("homePage").style.display = "block";

  communityPageView(newCommunity.name)
  //clear input data
  document.getElementById("community_name").value = '';
  document.getElementById("community_description").value = '';
  document.getElementById("creator_username").value = '';
  alert("Community created successfully!");
}

function orderNewest(page, comName = false){
  console.log("pressed newest");
  console.log("This is conName:" + comName);
  let comPosts = [...posts];
  if(page == "community"){
    comPosts = filterPosts("community", comName);
  }

  if(page == "search"){
    comPosts = Array.from(filterPosts("search", comName));
  }

  comPosts.sort(function(a, b){
    return(b.postedDate - a.postedDate)
  })

  console.log("Newest");
  console.log(comPosts);
  
  formatPost(comPosts, page);
  console.log(posts);
}

function orderOldest(page, comName = false){
  console.log("pressed oldest");
  let comPosts = [...posts];
  if(page == "community"){
    comPosts = filterPosts("community", comName);
  }

  if(page == "search"){
    comPosts = Array.from(filterPosts("search", comName));
  }

  comPosts.sort(function(a, b){
    return(a.postedDate - b.postedDate)
  })
  
  formatPost(comPosts, page);

  console.log(posts);
}

function orderActive(page, comName = false){
  console.log("pressed active");
  let comPosts = [...posts];
  if(page == "community"){
    comPosts = filterPosts("community", comName);
  }

  if(page == "search"){
    comPosts = Array.from(filterPosts("search", comName));
  }

  let activePost = new Map([]);
  for(const x of comPosts){
    let commentArray = getTotalComments(x);
    commentArray.sort(function(a, b){
      return(b.commentedDate - a.commentedDate)
    });
    activePost.set(x, commentArray[0].commentedDate);
  }
  comPosts = Array.from(activePost)
  console.log("BEFORE");
  console.log(comPosts);

  comPosts.sort(function(a, b){
    return(b[1] - a[1]);
  });

  console.log("AFTER");
  console.log(comPosts);
  comPosts = comPosts.map(function(element){
    return element[0];
  })
  
  formatPost(comPosts, page);

  console.log(posts);
}

function getCommunity(postID){
  for(const x of communities){
    if(x.postIDs.includes(postID)){
      return x.name;
    }
  }
}

function getComment(commentName){
  for(const x of comments){
    if(x.commentID == (commentName)){
      return x;
    }
  }
  return null;
}

function getTotalComments(post){
  let commentArray = [];
  if(post == null || post.commentIDs.length == 0 || post.commentIDs == null){
    return commentArray;
  }

  post.commentIDs.sort(function(a,b){
    console.log("in the sort");
    return(getComment(b).commentedDate - getComment(a).commentedDate)
  });
  // console.log("THIS IS SORTED");
  // console.log(post.commentIDs);

  let total = post.commentIDs.length;
  for(let i = 0; i < total; i++){
    let comment = getComment(post.commentIDs[i]);
    if(comment != null){
      // console.log("COMMENT GETTING PUSHED INTO ARRAY");
      // console.log(comment);
      commentArray.push(comment);

      let children = getTotalComments(comment);
      // console.log("CHILDREN BEING CONCAT");
      // console.log(children);

      
      commentArray = commentArray.concat(children);
      // console.log("CONCATING");
      // console.log(commentArray.concat(children));
      // console.log("ARRAY AFTER");
      // console.log(commentArray);
    }
  }
  // console.log("ARRAY BEING RETURNED");
  // console.log(commentArray);
  return commentArray;
}

function getCommentNum(post){
  // console.log("POST OR COMMENT: ");
  // console.log(post);

  if(post == null || post.commentIDs.length == 0 || post.commentIDs == null){
    // console.log("IN NULL RN BRO");
    return 0;
  }

  let total = post.commentIDs.length;
  for(let i = 0; i < total; i++){
    let comment = getComment(post.commentIDs[i]);
    if(comment != null){
      total += getCommentNum(comment);
    }
  }
  return total;
}

function getLinkFlair(linkFlairID){
  if(linkFlairID === ''){
    return "not FOUND";
  }
  for(const x of linkFlairs){
    if(x.linkFlairID.includes(linkFlairID)){
      console.log(x.linkFlairID.includes(linkFlairID));
      return x.content;
    }
  }
}

function formatPost(postToDisplay, page){
  //console.log(comName);
  const postsContainer = document.getElementById("posts");
  postsContainer.innerHTML = 
  `<div id="postCount">
    </div>
  `;

  if(page == "community"){
    document.getElementById("postCount").style.display = "none";
  }
  else{
    document.getElementById("postCount").style.display = "block";
  }
  let typeOfPosts = Array.from(postToDisplay);

  // console.log("THIS IS THE POST ARRAY RIGHT NOW");
  // console.log(typeOfPosts);
  
  for(const x of typeOfPosts){
    // console.log(x);
    const postInfo = getPost(x);
    let linkFlair = 
    `
      <span class="linkFlair">
        ${postInfo[4]}
      </span>
    `;
    if(postInfo[4] === 'not FOUND'){
      linkFlair = ``;
    }
    let homePage = 
    `
      <div class="comName">
        ${postInfo[0]}
      </div>
      <span>•</span>
    `;
    if(page == "community"){
      homePage = ``;
    }
    const postCreate = document.createElement("div");
    postCreate.className = "post"
    postCreate.setAttribute("data-postTitle", postInfo[3]);

    postCreate.innerHTML = 
    `
      <div class="topOfPost">
        ${homePage}
        <div class="user">
          ${postInfo[1]}
        </div>
        <span>•</span>
        <div class="time">
          ${postInfo[2]}
        </div>
      </div>
      <div class="postTitle">
      ${postInfo[3]} 
      
      ${linkFlair}
      
      </div>
      ${postInfo[5]}<br>
      <div class="counters">
        <img
          class="viewIcon"
          src="images/view.svg"
          height="20"
          width="20"
        />
        ${postInfo[6]}
        <img
          src="images/comment.svg"
          height="17"
          width="17"
        />
        ${postInfo[7]}
      </div>
    `
    postCounter++;
    postsContainer.append(postCreate);
  }
  if(postCounter >= posts.length){
    document.getElementById("postCount").innerHTML = typeOfPosts.length + " Posts";
  }

  let postList = document.getElementsByClassName("post");
  //console.log(postList);
  for(let i = 0; i < postList.length; i++){
    postList[i].onclick = function(event) {
      event.preventDefault();
      const postName = postList[i].getAttribute("data-postTitle");
      document.getElementById("buttonSection").style.display = "none";
      //console.log(postName);
      postPageView(postName);
    }
  };
}

function getPost(post){
  // console.log(post);
  const community = getCommunity(post.postID);
  const userName = post.postedBy;
  const timeStamp = findTime(post.postedDate)
  const postTitle = post.title;
  const postlinkFlairID = getLinkFlair(post.linkFlairID)
  const first20 = post.content.substring(0, 20);
  const viewCount = post.views
  const commentCount = getCommentNum(post);

  return [community, userName, timeStamp, postTitle, postlinkFlairID, first20, viewCount, commentCount];

}

function findTime(startTime){
  //console.log(startTime);
  const userTime = new Date();
  const submittedTime = new Date(startTime);
  const diff = userTime.getTime() - submittedTime.getTime();

  console.log("Time Difference: " + diff);

  const seconds = Math.floor(diff/1000);
  const minutes = Math.floor(diff/(1000 * 60));
  const hours = Math.floor(diff/(1000 * 60 * 60));
  const days = Math.floor(diff/(1000 * 60 * 60 * 24));
  const months = Math.floor(diff/(1000 * 60 * 60 * 24 * 30));
  const years = Math.floor(diff/(1000 * 60 * 60 * 24 * 30 * 12));


  if(seconds < 60){
    //console.log("Time Difference: " + seconds + " seconds");
    return seconds + " seconds ago";
  }
  else if(minutes < 60){
    //console.log("Time Difference: " + minutes + " minutes");
    return minutes + " minutes ago";
  }
  else if(hours < 24){
    //console.log("Time Difference: " + hours + " hours");
    return hours + " hour(s) ago";
  }
  else if(days < 30){
    //console.log("Time Difference: " + days + " days");
    return days + " day(s) ago";
  }
  else if(months < 12){
    //console.log("Time Difference: " + months + " months");
    return months + " month(s) ago";
  }
  else{
    //console.log("Time Difference: " + years + " years");
    return years + " year(s) ago";
  }
};