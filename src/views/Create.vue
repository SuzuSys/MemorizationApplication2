<template>
  <div>
    <el-container id="top">
      <el-button icon="el-icon-d-arrow-left" id="go_top" @click="goTop">Top Page</el-button>
      <el-aside width="400px">
        <el-row>
          <el-col :span="24">
            Operation Target:
            <el-radio-group v-model="operation_target" size="medium">
              <el-radio-button label="c">Cell</el-radio-button>
              <el-radio-button label="d">Directory</el-radio-button>
            </el-radio-group>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-cascader
              placeholder="Select Directory"
              @change="handleChangeTargetDirectory"
              :options="directory_tree"
              :props="{ checkStrictly: true }"
              :show-all-levels="false"
              v-if="show_directory_tree">
            </el-cascader>
            <span class="left_margin">
              <el-tag v-if="directory_target_type === 'r'" type="warning">Root</el-tag>
              <el-tag v-if="directory_target_type === 'n'">Node</el-tag>
              <el-tag v-if="directory_target_type === 'l'" type="success">Leaf</el-tag>
            </span>
          </el-col>
        </el-row>
        <el-divider content-position="left">Cell Tree</el-divider>
        <el-tree
          empty-text="No Cell"
          :data="cell_tree"
          @node-click="handleClickCell"
          node-key="id"
          v-if="selected_leaf_directory_target"></el-tree>
      </el-aside>

      <el-main>
        <div id="foundation">
          <div v-if="operation_target === 'c'">
            <el-row class="small_space">
              <el-col :span="5">
                Target Directory:
              </el-col>
              <el-col :span="19">
                <span :class="'directory_' + directory_target_type">{{ directory_target_label }}</span>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="5">
                Target Cell:
              </el-col>
              <el-col :span="19">
                <span :class="cell_target_layer === 0 ? 'cell_r' : cell_target_layer > 0 ? 'cell_n' : ''">{{ cell_target_label }}</span>
              </el-col>
            </el-row>
            <el-row v-if="selected_cell_target">
              <el-col :span="24">
                <Question 
                  :key="reload_question_key_for_target"
                  :idx="0"
                  :digit="1"
                  :x="cell_target_x"
                  :x_class="cell_target_x_class"
                  :y="cell_target_y"
                  :y_class="cell_target_y_class"
                  :isextype="false"
                  :show_answer="true"
                  :alone="true"
                  :carryImg="true"
                  :id="cell_target_id"
                  :img="cell_target_img" />
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-tabs v-model="active_cell_mode" type="card">
                  <el-tab-pane label="Make Cell" name="make" :disabled="!selected_leaf_directory_target"></el-tab-pane>
                  <el-tab-pane label="Correct Cell" name="correct" :disabled="!selected_cell_target"></el-tab-pane>
                  <el-tab-pane label="Delete Cell" name="delete" :disabled="!(selected_cell_target && cell_target_children_isempty)"></el-tab-pane>
                </el-tabs>
              </el-col>
            </el-row>
            <el-row v-show="active_cell_mode === 'make'">
              <el-col :span="24">
                <span class="section">Make Cell</span>
              </el-col>
            </el-row>
            <el-row v-show="active_cell_mode === 'make'">
              <el-col :span="24">
                <el-form
                  ref="adding_cell"
                  :model="adding_cell"
                  label-width="100px"
                  size="mini">
                    <el-form-item label="type">
                      <el-radio-group v-model="adding_cell.type">
                        <el-radio-button label="r">Root</el-radio-button>
                        <el-radio-button label="n" :disabled="!selected_cell_target">Node</el-radio-button>
                      </el-radio-group>
                      <span
                        v-show="adding_cell.type === 'n'"
                        class="left_margin">
                          Insert into: <span :class="cell_target_layer === 0 ? 'cell_r' : 'cell_n'">{{ cell_target_label }}</span>
                      </span>
                    </el-form-item>
                     <el-form-item label="label">
                      <el-input v-model="adding_cell.label"></el-input>
                    </el-form-item>
                    <el-form-item label="isnumerical">
                      <el-switch v-model="adding_cell.isnumerical"></el-switch>
                    </el-form-item>
                    <el-form-item label="x">
                      <el-input v-model="adding_cell.x" type="textarea" autosize></el-input>
                    </el-form-item>
                    <el-form-item label="x_class">
                      <el-input v-model="adding_cell.x_class"></el-input>
                    </el-form-item>
                    <el-form-item label="y">
                      <el-input v-model="adding_cell.y" type="textarea" autosize></el-input>
                    </el-form-item>
                    <el-form-item label="y_class">
                      <el-input v-model="adding_cell.y_class"></el-input>
                    </el-form-item>
                    <el-form-item label="image">
                      <el-upload
                        class="upload-demo"
                        action="" 
                        :on-change="handleAddImage"
                        :on-remove="handleRemoveImage"
                        :file-list="adding_cell.file_list" 
                        list-type="picture"
                        :auto-upload="false">
                          <el-button size="mini" type="primary">Click to upload</el-button>
                          <div slot="tip" class="el-upload__tip">
                            .png
                          </div>
                      </el-upload>
                    </el-form-item>
                    <el-form-item>
                      <el-button
                        type="primary"
                        @click="addCell"
                        :disabled="adding_cell.x === '' || adding_cell.y === ''" 
                        icon="el-icon-check"
                        size="medium">
                          Submit
                      </el-button>
                    </el-form-item>
                </el-form>
              </el-col>
            </el-row>
            <el-row v-show="active_cell_mode === 'make'">
              <el-col :span="24">
                <el-button @click="reloadQuestionForAdd" icon="el-icon-bottom" size="mini">Reload</el-button>
              </el-col>
            </el-row>
            <el-row v-show="active_cell_mode === 'make'">
              <el-col :span="24">
                <Question 
                  :key="reload_question_key_for_add"
                  :idx="0"
                  :digit="1"
                  :x="adding_cell.x"
                  :x_class="adding_cell.x_class"
                  :y="adding_cell.y"
                  :y_class="adding_cell.y_class"
                  :isextype="false"
                  :show_answer="true"
                  :alone="true"
                  :carryImg="false"
                  :blob="adding_cell.blob" />
              </el-col>
            </el-row>
            <el-row v-show="active_cell_mode === 'correct'">
              <el-col :span="24">
                <span class="section">Correct Cell</span>
              </el-col>
            </el-row>
            <el-row v-show="active_cell_mode === 'correct'">
              <el-col :span="24">
                <el-form
                  ref="correcting_cell"
                  :model="correcting_cell"
                  label-width="100px"
                  size="mini">
                    <el-form-item label="label">
                      <el-input v-model="correcting_cell.label"></el-input>
                    </el-form-item>
                    <el-form-item label="isnumerical">
                      <el-switch v-model="correcting_cell.isnumerical"></el-switch>
                    </el-form-item>
                    <el-form-item label="x">
                      <el-input v-model="correcting_cell.x" type="textarea" autosize></el-input>
                    </el-form-item>
                    <el-form-item label="x_class">
                      <el-input v-model="correcting_cell.x_class"></el-input>
                    </el-form-item>
                    <el-form-item label="y">
                      <el-input v-model="correcting_cell.y" type="textarea" autosize></el-input>
                    </el-form-item>
                    <el-form-item label="y_class">
                      <el-input v-model="correcting_cell.y_class"></el-input>
                    </el-form-item>
                    <el-form-item label="image">
                      <el-upload
                        class="upload-demo"
                        action="" 
                        :on-change="handleAddImageForCorrect"
                        :on-remove="handleRemoveImageForCorrect"
                        :file-list="correcting_cell.file_list" 
                        list-type="picture"
                        :auto-upload="false">
                          <el-button size="mini" type="primary">Click to upload</el-button>
                          <div slot="tip" class="el-upload__tip">
                            .png
                          </div>
                      </el-upload>
                    </el-form-item>
                    <el-form-item>
                      <el-button
                        type="primary"
                        @click="correctCell"
                        :disabled="correcting_cell.x === '' || correcting_cell.y === ''" 
                        icon="el-icon-check"
                        size="medium">
                          Submit
                        </el-button>
                    </el-form-item>
                </el-form>
              </el-col>
            </el-row>
            <el-row v-show="active_cell_mode === 'correct'">
              <el-col :span="24">
                <el-button @click="reloadQuestionForCorrect" icon="el-icon-bottom" size="mini">Reload</el-button>
              </el-col>
            </el-row>
            <el-row v-show="active_cell_mode === 'correct'">
              <el-col :span="24">
                <Question 
                  :key="reload_question_key_for_correct"
                  :idx="0"
                  :digit="1"
                  :x="correcting_cell.x"
                  :x_class="correcting_cell.x_class"
                  :y="correcting_cell.y"
                  :y_class="correcting_cell.y_class"
                  :isextype="false"
                  :show_answer="true"
                  :alone="true"
                  :carryImg="false"
                  :blob="correcting_cell.blob" />
              </el-col>
            </el-row>
            <el-row v-show="active_cell_mode === 'delete'">
              <el-col :span="24">
                <span class="section">Delete Cell</span>
              </el-col>
            </el-row>
            <el-row v-show="active_cell_mode === 'delete'">
              <el-col :span="22" :offset="2">
                Target Cell: 
                <span :class="cell_target_layer === 0 ? 'cell_r' : cell_target_layer > 0 ? 'cell_n' : ''">{{ cell_target_label }}</span>
              </el-col>
            </el-row>
            <el-row v-show="active_cell_mode === 'delete'">
              <el-col :span="22" :offset="2">
                <el-button 
                  type="danger"
                  plain icon="el-icon-delete"
                  @click="deleteCell">
                    Delete Cell
                </el-button>
              </el-col>
            </el-row>
          </div>
          <div v-if="operation_target === 'd'">
            <el-row>
              <el-col :span="5">
                Target Directory:
              </el-col>
              <el-col :span="19">
                <span :class="'directory_' + directory_target_type">{{ directory_target_label }}</span>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-tabs v-model="active_directory_mode" type="card">
                  <el-tab-pane label="Make Directory" name="make"></el-tab-pane>
                  <el-tab-pane label="Rename Directory" name="rename" :disabled="!selected_directory_target"></el-tab-pane>
                  <el-tab-pane label="Migrate Directory" name="migrate" :disabled="!(selected_directory_target && directory_target_type !== 'r')"></el-tab-pane>
                  <el-tab-pane label="Delete Directory" name="delete" :disabled="!(selected_directory_target && directory_target_children_isempty)"></el-tab-pane>
                </el-tabs>
              </el-col>
            </el-row>
            <el-row v-show="active_directory_mode === 'make'">
              <el-col :span="24">
                <span class="section">Make Directory</span>
              </el-col>
            </el-row>
            <el-row v-show="active_directory_mode === 'make'">
              <el-col :span="24">
                <el-form
                  ref="adding_directory"
                  :model="adding_directory"
                  label-width="100px"
                  size="medium">
                    <el-form-item label="type">
                      <el-radio-group v-model="adding_directory.type" size="medium">
                        <el-radio-button label="r">Root</el-radio-button>
                        <el-radio-button label="n" :disabled="directory_target_type === '' || directory_target_type === 'l'">Node</el-radio-button>
                        <el-radio-button label="l" :disabled="directory_target_type === '' || directory_target_type === 'l'">Leaf</el-radio-button>
                      </el-radio-group>
                      <span
                        v-show="this.adding_directory.type === 'n' || this.adding_directory.type === 'l'"
                        class="left_margin">
                          Insert into: <span :class="'directory_' + directory_target_type">{{ directory_target_label }}</span>
                      </span>
                    </el-form-item>
                    <el-form-item label="name">
                      <el-input v-model="adding_directory.name"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="addDirectory" :disabled="adding_directory.name === ''" icon="el-icon-check">Submit</el-button>
                    </el-form-item>
                </el-form>
              </el-col>
            </el-row>
            <el-row v-show="active_directory_mode === 'rename'">
              <el-col :span="24">
                <span class="section">Rename Directory</span>
              </el-col>
            </el-row>
            <el-row v-show="active_directory_mode === 'rename'">
              <el-col :span="22" :offset="2">
                Renaming target:
                <span :class="'directory_' + directory_target_type">{{ directory_target_label }}</span>
              </el-col>
            </el-row>
            <el-row v-show="active_directory_mode === 'rename'">
              <el-col :span="22" :offset="2">
                <el-form
                  ref="renaming_directory"
                  :model="renaming_directory"
                  size="medium"
                  :inline="true">
                    <el-form-item label="rename:">
                      <el-input v-model="renaming_directory.name"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <el-button
                        type="primary"
                        @click="renameDirectory"
                        icon="el-icon-check"
                        :disabled="renaming_directory.name === '' || renaming_directory.name === directory_target_label">
                          Submit
                      </el-button>
                    </el-form-item>
                </el-form>
              </el-col>
            </el-row>
            <el-row v-show="active_directory_mode === 'migrate'">
              <el-col :span="24">
                <span class="section">Migrate Directory</span>
              </el-col>
            </el-row>
            <el-row v-show="active_directory_mode === 'migrate'">
              <el-col :span="22" :offset="2">
                Migrating target:
                <span :class="'directory_' + directory_target_type">{{ directory_target_label }}</span>
              </el-col>
            </el-row>
            <el-row v-show="active_directory_mode === 'migrate'">
              <el-col :span="22" :offset="2">
                <el-form
                  ref="migrating_directory"
                  :model="migrating_directory"
                  size="medium"
                  :inline="true">
                    <el-form-item label="migrate to:">
                      <el-cascader
                        placeholder="Select Directory"
                        @change="handleChangeMigratingDirectory"
                        :options="directory_tree"
                        :props="migrating_directory_tree_props"
                        :show-all-levels="false"
                        v-if="show_migrating_directory_tree">
                      </el-cascader>
                    </el-form-item>
                    <el-form-item>
                      <el-button
                        type="primary"
                        @click="migrateDirectory"
                        icon="el-icon-check"
                        :disabled="migrating_directory.to_id === ''">
                          Submit
                      </el-button>
                    </el-form-item>
                </el-form>
              </el-col>
            </el-row>
            <el-row v-show="active_directory_mode === 'delete'">
              <el-col :span="24">
                <span class="section">Delete Directory</span>
              </el-col>
            </el-row>
            <el-row v-show="active_directory_mode === 'delete'">
              <el-col :span="22" :offset="2">
                Deleting target:
                <span :class="'directory_' + directory_target_type">{{ directory_target_label }}</span>
              </el-col>
            </el-row>
            <el-row v-show="active_directory_mode === 'delete'">
              <el-col :span="22" :offset="2">
                <el-button 
                  type="danger"
                  plain icon="el-icon-delete"
                  @click="deleteDirectoryDialog">
                    Delete Directory
                  </el-button>
              </el-col>
            </el-row>
            <el-dialog
              title="Warning"
              :visible.sync="delete_directory_dialog"
              width="30%"
              center>
              <span>この Leaf Directory 配下の全ての Cell が削除されます。よろしいですか？</span>
              <span slot="footer" class="dialog-footer">
                <el-button @click="delete_directory_dialog = false">Cancel</el-button>
                <el-button type="primary" @click="deleteDirectory">Confirm</el-button>
              </span>
            </el-dialog>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import DatabasePrototype from '../api/methods'
import Question from '../components/Question'
import Database from '../apicreate'
export default {
  name: 'Create',
  components: {
    Question
  },
  data() {
    return {
      operation_target: 'c',
      directory_tree: [],
      show_directory_tree: true,

      active_directory_mode: 'make',

      selected_directory_target: false,
      directory_target_id: '',
      directory_target_type: '',
      directory_target_label: 'None',
      directory_target_children_isempty: false,

      adding_directory: {
        type: 'r',
        name: '',
      },

      renaming_directory: {
        name: ''
      },

      migrating_directory: {
        to_id: ''
      },
      migrating_directory_tree_props: {
        label: 'label',
        children: 'children',
        disabled: 'isleaf',
        checkStrictly: true
      },
      show_migrating_directory_tree: true,

      delete_directory_dialog: false,

      active_cell_mode: '',

      reload_question_key_for_target: 0,
      selected_leaf_directory_target: false,
      selected_cell_target: false,
      cell_tree: [],
      cell_target_id: '',
      cell_target_layer: -1,
      cell_target_x: '',
      cell_target_x_class: '',
      cell_target_y: '',
      cell_target_y_class: '',
      cell_target_label: 'None',
      cell_target_img: [],
      cell_target_children_isempty: false,

      reload_question_key_for_add: 0,
      adding_cell: {
        type: 'r',
        label: '',
        isnumerical: false,
        x: '',
        x_class: '',
        y: '',
        y_class: '',
        img: [],
        file_list: [],
        blob: {}
      },

      reload_question_key_for_correct: 0,
      correcting_cell: {
        label: '',
        isnumerical: false,
        x: '',
        x_class: '',
        y: '',
        y_class: '',
        img: [],
        file_list: [],
        blob: {},
        img_is_changed: false
      }
    }
  },
  methods: {
    resetDirectoryTree() {
      this.selected_directory_target = false;
      this.directory_target_id = '';
      this.directory_target_type = '';
      this.directory_target_label = 'None';
      this.directory_target_children_isempty = false;
      this.adding_directory.type = 'r';
      this.adding_directory.name = '';
      this.renaming_directory.name = '';
      this.migrating_directory.to_id = '';
      this.selected_leaf_directory_target = false;
      this.selected_cell_target = false;
      this.cell_tree = [];
      this.cell_target_id = '';
      this.cell_target_layer = -1;
      this.cell_target_label = 'None';
      this.cell_target_x = '';
      this.cell_target_x_class = '';
      this.cell_target_y = '';
      this.cell_target_y_class = '';
      this.cell_target_children_isempty = false;
      this.cell_target_img = [];
      this.show_directory_tree = false;
      this.show_migrating_directory_tree = false;
      Database.Base().get('/getDirectoryTree').then(result => {
        this.directory_tree = result.data;
        this.show_directory_tree = true;
        this.show_migrating_directory_tree = true;
      });
    },
    resetCellTreeForAdd() {
      this.selected_leaf_directory_target = false;
      const obj = {parentDirectory: this.directory_target_id};
      Database.Base().get('/getCellTree', {params: obj}).then(result => {
        this.cell_tree = result.data;
        this.selected_leaf_directory_target = true;
      });
    },
    resetCellTreeForCorrect() {
      this.selected_leaf_directory_target = false;
      this.cell_target_label = this.correcting_cell.label;
      this.cell_target_x = this.correcting_cell.x;
      this.cell_target_x_class = this.correcting_cell.x_class;
      this.cell_target_y = this.correcting_cell.y;
      this.cell_target_y_class = this.correcting_cell.y_class;
      this.cell_target_img = this.correcting_cell.img;
      this.reload_question_key_for_target++;
      const obj = { parentDirectory: this.directory_target_id };
      Database.Base().get('/getCellTree', {params: obj}).then(result => {
        this.cell_tree = result.data;
        this.selected_leaf_directory_target = true;
      });
    },
    resetCellTreeForDelete() {
      this.selected_leaf_directory_target = false;
      this.selected_cell_target = false;
      this.cell_target_id = '';
      this.cell_target_layer = -1;
      this.cell_target_x = this.correcting_cell.x = '';
      this.cell_target_x_class = this.correcting_cell.x_class = '';
      this.cell_target_y = this.correcting_cell.y = '';
      this.cell_target_y_class = this.correcting_cell.y_class = '';
      this.cell_target_label = this.correcting_cell.label = 'None';
      this.cell_target_img = this.correcting_cell.img = [];
      this.resetCorrectingCellImage();
      this.cell_target_children_isempty = false;
      this.correcting_cell.isnumerical = false;
      this.active_cell_mode = '';
      const obj = { parentDirectory: this.directory_target_id };
      Database.Base().get('/getCellTree', {params: obj}).then(result => {
        this.cell_tree = result.data;
        this.selected_leaf_directory_target = true;
      });
    },
    handleChangeTargetDirectory(data) {
      const target_obj = data[data.length - 1];
      this.directory_target_id = target_obj._id;
      this.directory_target_label = target_obj.name;
      this.directory_target_type = target_obj.type;
      this.directory_target_children_isempty = target_obj.children.length === 0;
      this.selected_directory_target = true;
      this.renaming_directory.name = this.directory_target_label;
      if (this.directory_target_type === 'l') {
        const obj = {parentDirectory: this.directory_target_id};
        Database.Base().get('/getCellTree', {params: obj}).then(result => {
          this.cell_tree = result.data;
          this.selected_leaf_directory_target = true;
        });
      }
      else {
        this.selected_leaf_directory_target = false;
      }
    },
    addDirectory() {
      const obj = {
        type: this.adding_directory.type,
        name: this.adding_directory.name,
        parent: this.directory_target_id
      };
      Database.Base().post("/addDirectory", obj).then(result => {
        if (result.status === 200) {
          this.$notify({
            title: 'Success',
            message: 'Successfully added directory',
            type: 'success'
          });
          this.resetDirectoryTree();
        }
        else {
          this.$notify({
            title: 'Error',
            message: 'Could not add directory successfully',
            type: 'error'
          });
        }
      });
    },
    renameDirectory() {
      const obj = {
        id: this.directory_target_id,
        name: this.renaming_directory.name
      };
      Database.Base().post("/renameDirectory", obj).then(result => {
        if (result.status === 200) {
          this.$notify({
            title: 'Success',
            message: 'Successfully renamed directory',
            type: 'success'
          });
          this.resetDirectoryTree();
        }
        else {
          this.$notify({
            title: 'Error',
            message: 'Could not rename directory successfully',
            type: 'error'
          });
        }
      });
    },
    handleChangeMigratingDirectory(data) {
      const obj = data[data.length - 1];
      this.migrating_directory.to_id = obj._id;
    },
    migrateDirectory() {
      if (this.directory_target_id === this.migrating_directory.to_id) {
        this.$message({
          message: 'The requested operation is invalid.',
          type: 'error'
        });
      }
      else {
        const obj = {
          id: this.directory_target_id,
          to: this.migrating_directory.to_id
        };
        Database.Base().post("/migrateDirectory", obj).then(result => {
          if (result.status === 200) {
            this.$notify({
              title: 'Success',
              message: 'Successfully migrated directory',
              type: 'success'
            });
            this.resetDirectoryTree();
          }
          else {
            this.$notify({
              title: 'Error',
              message: 'Could not migrate directory successfully',
              type: 'error'
            });
          }
        });
      }
    },
    deleteDirectoryDialog() {
      if (this.directory_target_type === 'l') this.delete_directory_dialog = true;
      else this.deleteDirectory();
    },
    deleteDirectory() {
      this.delete_directory_dialog = false;
      const obj = {id: this.directory_target_id};
      Database.Base().delete("/deleteDirectory", {data: obj}).then(result => {
        if (result.status === 200) {
          this.$notify({
            title: 'Success',
            message: 'Successfully deleted directory',
            type: 'success'
          });
          this.resetDirectoryTree();
        }
        else {
          this.$notify({
            title: 'Error',
            message: 'Could not delete directory successfully',
            type: 'error'
          });
        }
      });
    },
    handleClickCell(data) {
      this.cell_target_id = data.id;
      this.cell_target_layer = data.value.layer;
      this.selected_cell_target = true;
      this.correcting_cell.label = this.cell_target_label = data.label;
      this.correcting_cell.x = this.cell_target_x = data.value.x;
      this.correcting_cell.x_class = this.cell_target_x_class = data.value.x_class;
      this.correcting_cell.y = this.cell_target_y = data.value.y;
      this.correcting_cell.y_class = this.cell_target_y_class = data.value.y_class;
      this.correcting_cell.isnumerical = data.value.isnumerical;
      this.correcting_cell.img = this.cell_target_img = data.value.img;
      this.cell_target_children_isempty = data.value.children.length === 0;
      this.reload_question_key_for_target++;
      this.resetCorrectingCellImage();
      if (this.cell_target_img.length === 0) {
        this.reload_question_key_for_correct++;
      }
      else {
        (async () => {
          let key, result, url;
          const obj = { id: this.cell_target_id };
          for (let i = 0; i < this.cell_target_img.length; i++) {
            key = 'F_' + this.cell_target_img[i].split('.')[0];
            obj.filename = this.cell_target_img[i];
            result = await Database.Blob().get('/getImage', {params: obj});
            url = window.URL.createObjectURL(result.data);
            this.correcting_cell.blob[key] = url;
            this.correcting_cell.file_list.push({
              name: this.cell_target_img[i],
              url: url
            });
          }
          this.reload_question_key_for_correct++;
        })();
      }
    },
    addCell() {
      if (this.adding_cell.file_list.length === 0) {
        const obj = {
          parentDirectory: this.directory_target_id,
          label: this.adding_cell.label,
          isnumerical: this.adding_cell.isnumerical,
          x: this.adding_cell.x,
          x_class: this.adding_cell.x_class,
          y: this.adding_cell.y,
          y_class: this.adding_cell.y_class,
          isRoot: this.adding_cell.type === 'r'
        };
        if (this.adding_cell.type !== 'r') {
          obj.parent = this.cell_target_id;
        }
        Database.Base().post('/addCell', obj).then(this.notifyForAddCell);
      }
      else {
        const formData = new FormData();
        formData.append('parentDirectory', this.directory_target_id);
        formData.append('label', this.adding_cell.label);
        formData.append('isnumerical', this.adding_cell.isnumerical);
        formData.append('x', this.adding_cell.x);
        formData.append('x_class', this.adding_cell.x_class);
        formData.append('y', this.adding_cell.y);
        formData.append('y_class', this.adding_cell.y_class);
        formData.append('isRoot', this.adding_cell.type === 'r');
        if (this.adding_cell.type !== 'r') {
          formData.append('parent', this.cell_target_id);
        }
        for (let i = 0; i < this.adding_cell.file_list.length; i++) {
          formData.append('file[]', this.adding_cell.file_list[i].raw);
        }
        Database.Base().post('/addCellWithImage', formData, {
          headers: { 'content-type': 'multipart/form-data' }
        }).then(this.notifyForAddCell);
      }
    },
    notifyForAddCell(result) {
      if (result.status === 200) {
        this.$notify({
          title: 'Success',
          message: 'Successfully added cell',
          type: 'success'
        });
        this.resetCellTreeForAdd();
      }
      else {
        this.$notify({
          title: 'Error',
          message: 'Could not add cell successfully',
          type: 'error'
        });
      }
    },
    correctCell() {
      console.log('detect');
      if (this.correcting_cell.img_is_changed) {
        this.correcting_cell.img_is_changed = false;
        const formData = new FormData();
        formData.append('parentDirectory', this.directory_target_id);
        formData.append('id', this.cell_target_id);
        formData.append('label', this.correcting_cell.label);
        formData.append('isnumerical', this.correcting_cell.isnumerical);
        formData.append('x', this.correcting_cell.x);
        formData.append('x_class', this.correcting_cell.x_class);
        formData.append('y', this.correcting_cell.y);
        formData.append('y_class', this.correcting_cell.y_class);
        for (let i = 0; i < this.correcting_cell.img.length; i++) {
          formData.append('img[]', this.correcting_cell.img[i]);
        }
        for (let i = 0; i < this.correcting_cell.file_list.length; i++) {
          if (this.correcting_cell.file_list[i].status === 'ready') {
            formData.append('file[]', this.correcting_cell.file_list[i].raw);
          }
        }
        Database.Base().post('/correctCellWithImage', formData, {
          headers: { 'content-type': 'multipart/form-data' }
        }).then(this.notifyForCorrectCell);
      }
      else {
        const obj = {
          parentDirectory: this.directory_target_id,
          id: this.cell_target_id,
          label: this.correcting_cell.label,
          isnumerical: this.correcting_cell.isnumerical,
          x: this.correcting_cell.x,
          x_class: this.correcting_cell.x_class,
          y: this.correcting_cell.y,
          y_class: this.correcting_cell.y_class
        };
        Database.Base().post('/correctCell', obj).then(this.notifyForCorrectCell);
      }
    },
    notifyForCorrectCell(result) {
      if (result.status === 200) {
        this.$notify({
          title: 'Success',
          message: 'Successfully corrected cell',
          type: 'success'
        });
        this.resetCellTreeForCorrect();
      }
      else {
        this.$notify({
          title: 'Error',
          message: 'Could not correct cell successfully',
          type: 'error'
        });
      }
    },
    resetCorrectingCellImage() {
      const keys = Object.keys(this.correcting_cell.blob);
      for (let i = 0; i < keys.length; i++) {
        window.URL.revokeObjectURL(this.correcting_cell.blob[keys[i]]);
      }
      this.correcting_cell.blob = {};
      this.correcting_cell.file_list = [];
      this.correcting_cell.img_is_changed = false;
    },
    deleteCell() {
      const obj = {
        parentDirectory: this.directory_target_id,
        id: this.cell_target_id
      };
      DatabasePrototype.deleteCell(obj).then(result => {
        if (result.status === 200) {
          this.$notify({
            title: 'Success',
            message: 'Successfully deleted cell',
            type: 'success'
          });
          this.resetCellTreeForDelete();
        }
        else {
          this.$notify({
            title: 'Error',
            message: 'Could not delete cell successfully',
            type: 'error'
          });
        }
      });
    },
    reloadQuestionForAdd() {
      this.reload_question_key_for_add++;
    },
    reloadQuestionForCorrect() {
      this.reload_question_key_for_correct++;
    },
    handleAddImage(file, fileList) {
      const idx = this.adding_cell.img.indexOf(file.name);
      if (idx === -1) {
        this.adding_cell.file_list = fileList;
        const key = 'F_' + file.name.split('.')[0];
        this.adding_cell.blob[key] = window.URL.createObjectURL(file.raw);
        this.adding_cell.x += '%{' + key + '}';
        this.adding_cell.y += '%{' + key + '}';
      }
      else {
        this.$message({
          message: 'This filename is already in use.',
          type: 'error'
        });
      }
    },
    handleRemoveImage(file, fileList) {
      this.adding_cell.file_list = fileList;
      const key = 'F_' + file.name.split('.')[0];
      window.URL.revokeObjectURL(this.adding_cell.blob[key]);
      delete this.adding_cell.blob[key];
      this.adding_cell.x = this.adding_cell.x.replace('%{' + key + '}', '');
      this.adding_cell.y = this.adding_cell.y.replace('%{' + key + '}', '');
      const idx = this.adding_cell.img.indexOf(file.name);
      this.adding_cell.img.splice(idx, 1);
    },
    handleAddImageForCorrect(file, fileList) {
      const idx = this.correcting_cell.img.indexOf(file.raw.name);
      if (idx === -1) {
        this.correcting_cell.img.push(file.name);
        this.correcting_cell.file_list = fileList;
        const key = 'F_' + file.name.split('.')[0];
        this.correcting_cell.blob[key] = window.URL.createObjectURL(file.raw);
        this.correcting_cell.x += '%{' + key + '}';
        this.correcting_cell.y += '%{' + key + '}';
        this.correcting_cell.img_is_changed = true;
      }
      else {
        this.$message({
          message: 'This filename is already in use.',
          type: 'error'
        });
      }
    },
    handleRemoveImageForCorrect(file, fileList) {
      this.correcting_cell.file_list = fileList;
      const key = 'F_' + file.name.split('.')[0];
      window.URL.revokeObjectURL(this.correcting_cell.blob[key]);
      delete this.correcting_cell.blob[key];
      this.correcting_cell.x = this.correcting_cell.x.replace('%{' + key + '}', '');
      this.correcting_cell.y = this.correcting_cell.y.replace('%{' + key + '}', '');
      const idx = this.correcting_cell.img.indexOf(file.name);
      this.correcting_cell.img.splice(idx, 1);
      this.correcting_cell.img_is_changed = true;
    },
    goTop() {
      this.$router.push({ path: '/' });
    }
  },
  created: async function () {
    this.directory_tree = (await Database.Base().get('/getDirectoryTree')).data;
  }
}
</script>

<style scoped>
#top {
  height: 100vh;
  color: #505050;
}
.el-aside {
  background-color: white;
  padding: 10px;
}
.el-main {
  padding: 10px;
}
.el-row {
  margin-bottom: 15px;
}
.small_space {
  margin-bottom: 5px;
}
.section {
  font-size: 1.5em;
}
#foundation {
  margin: 0px auto;
  width: calc(793px - 2 * 10mm);
  background-color: white;
  padding: 10px 10mm;
}
.left_margin {
  margin-left: 10px;
}
.directory_r {
  color: #E6A23C;
}
.directory_n {
  color: #409EFF;
}
.directory_l {
  color: #67C23A;
}
.cell_r {
  color: #E6A23C;
}
.cell_n {
  color: #409EFF
}
#go_top {
  position: fixed;
  left: 20px;
  bottom: 20px;
}
</style>